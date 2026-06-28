using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Healthcare.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesForPerformance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TriageAssessments_ModelVersions_ModelVersionId",
                table: "TriageAssessments");

            migrationBuilder.DropForeignKey(
                name: "FK_TriageAssessments_doctors_EscalatedToDoctorId",
                table: "TriageAssessments");

            migrationBuilder.DropForeignKey(
                name: "FK_TriageAssessments_patients_PatientId",
                table: "TriageAssessments");

            migrationBuilder.DropForeignKey(
                name: "FK_TriagePredictions_TriageAssessments_TriageAssessmentId",
                table: "TriagePredictions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TriageAssessments",
                table: "TriageAssessments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AiPredictionLogs",
                table: "AiPredictionLogs");

            migrationBuilder.RenameTable(
                name: "TriageAssessments",
                newName: "triage_assessments");

            migrationBuilder.RenameTable(
                name: "AiPredictionLogs",
                newName: "ai_prediction_logs");

            migrationBuilder.RenameIndex(
                name: "IX_TriageAssessments_PatientId",
                table: "triage_assessments",
                newName: "IX_triage_assessments_PatientId");

            migrationBuilder.RenameIndex(
                name: "IX_TriageAssessments_ModelVersionId",
                table: "triage_assessments",
                newName: "IX_triage_assessments_ModelVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_TriageAssessments_EscalatedToDoctorId",
                table: "triage_assessments",
                newName: "IX_triage_assessments_EscalatedToDoctorId");

            migrationBuilder.AlterColumn<string>(
                name: "ModelVersionName",
                table: "ai_prediction_logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "CorrelationId",
                table: "ai_prediction_logs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_triage_assessments",
                table: "triage_assessments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ai_prediction_logs",
                table: "ai_prediction_logs",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_CreatedAt",
                table: "notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_Status",
                table: "notifications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_triage_assessments_IsEscalated",
                table: "triage_assessments",
                column: "IsEscalated");

            migrationBuilder.CreateIndex(
                name: "IX_triage_assessments_UrgencyLevel",
                table: "triage_assessments",
                column: "UrgencyLevel");

            migrationBuilder.CreateIndex(
                name: "IX_ai_prediction_logs_CorrelationId",
                table: "ai_prediction_logs",
                column: "CorrelationId");

            migrationBuilder.CreateIndex(
                name: "IX_ai_prediction_logs_Timestamp",
                table: "ai_prediction_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_ai_prediction_logs_UserId",
                table: "ai_prediction_logs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_triage_assessments_ModelVersions_ModelVersionId",
                table: "triage_assessments",
                column: "ModelVersionId",
                principalTable: "ModelVersions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_triage_assessments_doctors_EscalatedToDoctorId",
                table: "triage_assessments",
                column: "EscalatedToDoctorId",
                principalTable: "doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_triage_assessments_patients_PatientId",
                table: "triage_assessments",
                column: "PatientId",
                principalTable: "patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TriagePredictions_triage_assessments_TriageAssessmentId",
                table: "TriagePredictions",
                column: "TriageAssessmentId",
                principalTable: "triage_assessments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_triage_assessments_ModelVersions_ModelVersionId",
                table: "triage_assessments");

            migrationBuilder.DropForeignKey(
                name: "FK_triage_assessments_doctors_EscalatedToDoctorId",
                table: "triage_assessments");

            migrationBuilder.DropForeignKey(
                name: "FK_triage_assessments_patients_PatientId",
                table: "triage_assessments");

            migrationBuilder.DropForeignKey(
                name: "FK_TriagePredictions_triage_assessments_TriageAssessmentId",
                table: "TriagePredictions");

            migrationBuilder.DropIndex(
                name: "IX_notifications_CreatedAt",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "IX_notifications_Status",
                table: "notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_triage_assessments",
                table: "triage_assessments");

            migrationBuilder.DropIndex(
                name: "IX_triage_assessments_IsEscalated",
                table: "triage_assessments");

            migrationBuilder.DropIndex(
                name: "IX_triage_assessments_UrgencyLevel",
                table: "triage_assessments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ai_prediction_logs",
                table: "ai_prediction_logs");

            migrationBuilder.DropIndex(
                name: "IX_ai_prediction_logs_CorrelationId",
                table: "ai_prediction_logs");

            migrationBuilder.DropIndex(
                name: "IX_ai_prediction_logs_Timestamp",
                table: "ai_prediction_logs");

            migrationBuilder.DropIndex(
                name: "IX_ai_prediction_logs_UserId",
                table: "ai_prediction_logs");

            migrationBuilder.RenameTable(
                name: "triage_assessments",
                newName: "TriageAssessments");

            migrationBuilder.RenameTable(
                name: "ai_prediction_logs",
                newName: "AiPredictionLogs");

            migrationBuilder.RenameIndex(
                name: "IX_triage_assessments_PatientId",
                table: "TriageAssessments",
                newName: "IX_TriageAssessments_PatientId");

            migrationBuilder.RenameIndex(
                name: "IX_triage_assessments_ModelVersionId",
                table: "TriageAssessments",
                newName: "IX_TriageAssessments_ModelVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_triage_assessments_EscalatedToDoctorId",
                table: "TriageAssessments",
                newName: "IX_TriageAssessments_EscalatedToDoctorId");

            migrationBuilder.AlterColumn<string>(
                name: "ModelVersionName",
                table: "AiPredictionLogs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "CorrelationId",
                table: "AiPredictionLogs",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddPrimaryKey(
                name: "PK_TriageAssessments",
                table: "TriageAssessments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AiPredictionLogs",
                table: "AiPredictionLogs",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TriageAssessments_ModelVersions_ModelVersionId",
                table: "TriageAssessments",
                column: "ModelVersionId",
                principalTable: "ModelVersions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TriageAssessments_doctors_EscalatedToDoctorId",
                table: "TriageAssessments",
                column: "EscalatedToDoctorId",
                principalTable: "doctors",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TriageAssessments_patients_PatientId",
                table: "TriageAssessments",
                column: "PatientId",
                principalTable: "patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TriagePredictions_TriageAssessments_TriageAssessmentId",
                table: "TriagePredictions",
                column: "TriageAssessmentId",
                principalTable: "TriageAssessments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
