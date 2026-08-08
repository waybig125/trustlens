package com.example

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

enum class RiskLevel {
    LOW, MEDIUM, HIGH
}

data class Applicant(
    val id: String,
    val name: String,
    val occupation: String,
    val riskLevel: RiskLevel,
    val aiConfidence: Int,
    val aiReasoning: String,
    val signals: Map<String, String>,
    var status: String = "Pending Review"
)

val mockApplicants = listOf(
    Applicant(
        id = "1",
        name = "Amina Bibi",
        occupation = "Teacher",
        riskLevel = RiskLevel.LOW,
        aiConfidence = 96,
        aiReasoning = "LOW RISK CONFIDENCE (96%): Consistent income matching stated transaction volume. Address verified via secondary utility source. No unusual cross-border activity.",
        signals = mapOf(
            "Income" to "PKR 60,000/month",
            "Expected Volume" to "PKR 40,000/month",
            "Address" to "Matching",
            "Intent" to "Savings & Local Transfers"
        ),
        status = "Auto-Approved"
    ),
    Applicant(
        id = "2",
        name = "Kamran",
        occupation = "Shopkeeper",
        riskLevel = RiskLevel.HIGH,
        aiConfidence = 89,
        aiReasoning = "HIGH RISK CONFIDENCE (89%): Declared income of PKR 40,000/month does not match expected international transaction volume of PKR 2,500,000/month. Address verification shows cross-district variance. Action required: Enhanced Due Diligence.",
        signals = mapOf(
            "Income" to "PKR 40,000/month",
            "Expected Volume" to "PKR 2,500,000/month",
            "Address" to "Cross-District Variance",
            "Intent" to "International Trading"
        )
    ),
    Applicant(
        id = "3",
        name = "Zaid Khan",
        occupation = "Freelancer",
        riskLevel = RiskLevel.MEDIUM,
        aiConfidence = 72,
        aiReasoning = "MEDIUM RISK CONFIDENCE (72%): New identity file. Income source is variable. Pending secondary KYC verification.",
        signals = mapOf(
            "Income" to "Variable",
            "Expected Volume" to "PKR 150,000/month",
            "Address" to "Pending",
            "Intent" to "Freelance Receipts"
        )
    )
)

data class AppState(
    val isDarkMode: Boolean = true,
    val isOfficerMode: Boolean = false,
    val applicants: List<Applicant> = mockApplicants,
    val currentApplicantForm: Map<String, String> = emptyMap(),
    val applicantStatus: String? = null
)

class AppViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AppState())
    val uiState: StateFlow<AppState> = _uiState.asStateFlow()

    fun toggleTheme() {
        _uiState.update { it.copy(isDarkMode = !it.isDarkMode) }
    }

    fun toggleRole() {
        _uiState.update { it.copy(isOfficerMode = !it.isOfficerMode) }
    }

    fun submitApplicantForm(form: Map<String, String>) {
        _uiState.update {
            it.copy(
                currentApplicantForm = form,
                applicantStatus = "Application Under AI Review"
            )
        }
    }

    fun updateApplicantStatus(id: String, newStatus: String, newRiskLevel: RiskLevel? = null) {
        _uiState.update { state ->
            val updated = state.applicants.map { app ->
                if (app.id == id) {
                    app.copy(
                        status = newStatus,
                        riskLevel = newRiskLevel ?: app.riskLevel
                    )
                } else app
            }
            state.copy(applicants = updated)
        }
    }
}
