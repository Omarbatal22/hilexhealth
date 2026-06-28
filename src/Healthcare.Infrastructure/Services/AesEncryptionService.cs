using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Services;

public class AesEncryptionService : IEncryptionService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AesEncryptionService> _logger;
    private readonly string _activeKeyVersion;
    private readonly Dictionary<string, byte[]> _keys = new();
    private readonly byte[] _iv;

    public AesEncryptionService(IConfiguration configuration, ILogger<AesEncryptionService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var section = _configuration.GetSection("EncryptionSettings");
        _activeKeyVersion = section["ActiveKeyVersion"] ?? "v1";

        var rawIv = section["IV"] ?? "VectorInitialization1";
        _iv = GetValidKey(Encoding.UTF8.GetBytes(rawIv), 16); // 128 bit IV

        // Load all configured keys
        var keysSection = section.GetSection("Keys");
        foreach (var child in keysSection.GetChildren())
        {
            if (!string.IsNullOrEmpty(child.Value))
            {
                _keys[child.Key] = GetValidKey(Encoding.UTF8.GetBytes(child.Value), 32); // 256 bit key
            }
        }

        if (!_keys.ContainsKey(_activeKeyVersion))
        {
            throw new InvalidOperationException($"Active encryption key version '{_activeKeyVersion}' is not configured in settings under EncryptionSettings:Keys.");
        }
    }

    private static byte[] GetValidKey(byte[] raw, int size)
    {
        var valid = new byte[size];
        Array.Copy(raw, valid, Math.Min(raw.Length, size));
        return valid;
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;

        if (!_keys.TryGetValue(_activeKeyVersion, out var key))
        {
            throw new InvalidOperationException($"Active key version '{_activeKeyVersion}' is not configured.");
        }

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = _iv;

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
            }
        }

        var cipherBase64 = Convert.ToBase64String(ms.ToArray());
        return $"{_activeKeyVersion}:{cipherBase64}";
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText)) return cipherText;

        string keyVersion = "v1";
        string actualCipher = cipherText;

        // Check if prefixed with key version (e.g. "v2:...")
        if (cipherText.Contains(':'))
        {
            var parts = cipherText.Split(':', 2);
            if (parts[0].StartsWith('v') && parts[0].Length > 1 && int.TryParse(parts[0].Substring(1), out _))
            {
                keyVersion = parts[0];
                actualCipher = parts[1];
            }
        }

        if (!_keys.TryGetValue(keyVersion, out var key))
        {
            _logger.LogWarning("Key version '{Version}' not found for decryption. Falling back to active key.", keyVersion);
            if (!_keys.TryGetValue(_activeKeyVersion, out key))
            {
                throw new InvalidOperationException("No suitable decryption key available.");
            }
        }

        try
        {
            using var aes = Aes.Create();
            aes.Key = key;
            aes.IV = _iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(Convert.FromBase64String(actualCipher));
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);

            return sr.ReadToEnd();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to decrypt cipher text. Stored data may be corrupt or encrypted with a different key.");
            throw new InvalidOperationException("Stored message could not be decrypted securely.", ex);
        }
    }
}
