package com.example

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppHeader(viewModel: AppViewModel, state: AppState) {
    Column {
        TopAppBar(
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Shield,
                            contentDescription = "Logo",
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "TrustLens",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        letterSpacing = (-0.5).sp
                    )
                }
            },
            actions = {
                Row(
                    modifier = Modifier
                        .clickable { viewModel.toggleRole() }
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                        .background(MaterialTheme.colorScheme.surface, CircleShape)
                        .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha=0.3f), CircleShape)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(MaterialTheme.colorScheme.primary, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        if (state.isOfficerMode) "OFFICER MODE" else "APPLICANT MODE",
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = { viewModel.toggleTheme() },
                    modifier = Modifier
                        .background(MaterialTheme.colorScheme.surface, CircleShape)
                        .size(40.dp)
                ) {
                    Icon(
                        if (state.isDarkMode) Icons.Default.DarkMode else Icons.Default.LightMode,
                        contentDescription = "Toggle Theme",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
        )
        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
    }
}

@Composable
fun WelcomeScreen(navController: NavController, state: AppState) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.Eco,
            contentDescription = null,
            modifier = Modifier.size(100.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(24.dp))
        Text("TrustLens Banking", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.onBackground, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "Playful, AI-powered digital onboarding and real-time risk intelligence.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.secondary,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(48.dp))
        
        Button(
            onClick = { navController.navigate("applicant_form") },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)
        ) {
            Text("Open An Account (Applicant)", fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedButton(
            onClick = { navController.navigate("officer_dashboard") },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = CircleShape,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onBackground),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
        ) {
            Text("Officer EDD Dashboard (Admin)", fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApplicantFormScreen(navController: NavController, viewModel: AppViewModel) {
    var name by remember { mutableStateOf("") }
    var idNum by remember { mutableStateOf("") }
    var income by remember { mutableStateOf("") }
    var intent by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    var isSubmitting by remember { mutableStateOf(false) }

    val progress = listOf(name, idNum, income, intent).count { it.isNotEmpty() } / 4f

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Text("Trust Garden", style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onBackground)
        Spacer(modifier = Modifier.height(24.dp))
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(24.dp))
                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha=0.3f), RoundedCornerShape(24.dp)),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    when {
                        progress == 0f -> Icons.Default.Grass
                        progress < 1f -> Icons.Default.LocalFlorist
                        else -> Icons.Default.Park
                    },
                    contentDescription = null,
                    tint = if (progress == 1f) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text("Seed Status: ${(progress * 100).toInt()}%", color = MaterialTheme.colorScheme.onSurface)
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = name, onValueChange = { name = it },
            label = { Text("Full Name") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.secondary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = idNum, onValueChange = { idNum = it },
            label = { Text("CNIC / ID Number") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.secondary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = income, onValueChange = { income = it },
            label = { Text("Declared Monthly Income") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.secondary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = intent, onValueChange = { intent = it },
            label = { Text("Account Purpose") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.secondary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline
            )
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = {
                coroutineScope.launch {
                    isSubmitting = true
                    delay(1500)
                    viewModel.submitApplicantForm(mapOf("Name" to name, "ID" to idNum, "Income" to income, "Intent" to intent))
                    navController.navigate("applicant_status") {
                        popUpTo("applicant_form") { inclusive = true }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)
        ) {
            if (isSubmitting) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp))
            } else {
                Text("Nourish & Submit Application", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ApplicantStatusScreen(navController: NavController, state: AppState) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Application Status", style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onBackground)
        Spacer(modifier = Modifier.height(24.dp))
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(24.dp))
                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha=0.3f), RoundedCornerShape(24.dp))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.HourglassEmpty,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(state.applicantStatus ?: "Unknown", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Your Trust Plant is growing while we review your details.", color = MaterialTheme.colorScheme.secondary, textAlign = TextAlign.Center)
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Column(modifier = Modifier.fillMaxWidth()) {
            Text("Submitted Details", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
            Spacer(modifier = Modifier.height(8.dp))
            state.currentApplicantForm.forEach { (key, value) ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(key, color = MaterialTheme.colorScheme.secondary)
                    Text(value, color = MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Medium)
                }
            }
        }
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Button(
            onClick = { navController.navigate("welcome") { popUpTo("welcome") { inclusive = true } } },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)
        ) {
            Text("Return to Home", fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OfficerDashboardScreen(navController: NavController, state: AppState) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "Low Risk (Thriving)", "Medium Risk", "High Risk (EDD Queue)")

    val filteredApplicants = state.applicants.filter {
        val matchesSearch = it.name.contains(searchQuery, ignoreCase = true) || it.id.contains(searchQuery)
        val matchesFilter = when (selectedFilter) {
            "Low Risk (Thriving)" -> it.riskLevel == RiskLevel.LOW
            "Medium Risk" -> it.riskLevel == RiskLevel.MEDIUM
            "High Risk (EDD Queue)" -> it.riskLevel == RiskLevel.HIGH
            else -> true
        }
        matchesSearch && matchesFilter
    }

    Column(modifier = Modifier.fillMaxSize()) {
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item { StatCard("Total Onboarded", "1,245") }
            item { StatCard("High Risk (EDD)", "12", isAlert = true) }
            item { StatCard("AI Accuracy", "98.4%") }
        }
        
        PaddingValues(horizontal = 24.dp).let { pv ->
            OutlinedTextField(
                value = searchQuery, onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                placeholder = { Text("Search applicant name, ID...") },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.secondary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )
            Spacer(modifier = Modifier.height(16.dp))
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filters) { filter ->
                    FilterChip(
                        selected = selectedFilter == filter,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(filteredApplicants) { applicant ->
                ApplicantCard(applicant, onClick = {
                    navController.navigate("edd_review/${applicant.id}")
                })
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, isAlert: Boolean = false) {
    Box(
        modifier = Modifier
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(24.dp))
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha=0.1f), RoundedCornerShape(24.dp))
            .padding(14.dp)
            .width(130.dp)
    ) {
        Column {
            Text(title, fontSize = 11.sp, color = MaterialTheme.colorScheme.secondary, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                Text(value, style = MaterialTheme.typography.headlineMedium, color = if (isAlert) ErrorRed else MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Bold)
                if (isAlert) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Critical", fontSize = 10.sp, color = ErrorRed, modifier = Modifier.padding(bottom = 6.dp))
                }
            }
        }
    }
}

@Composable
fun ApplicantCard(applicant: Applicant, onClick: () -> Unit) {
    val isHighRisk = applicant.riskLevel == RiskLevel.HIGH
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(24.dp))
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha=0.1f), RoundedCornerShape(24.dp))
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .background(if (isHighRisk) ErrorRed.copy(alpha=0.1f) else MaterialTheme.colorScheme.primary.copy(alpha=0.1f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                if (isHighRisk) Icons.Default.Warning else Icons.Default.Eco,
                contentDescription = null,
                tint = if (isHighRisk) ErrorRed else MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(28.dp)
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Text(applicant.name, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(
                    if (isHighRisk) "HIGH RISK" else "CLEARED",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isHighRisk) ErrorRed else MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.background(if (isHighRisk) ErrorRed.copy(alpha=0.1f) else MaterialTheme.colorScheme.onBackground.copy(alpha=0.05f), RoundedCornerShape(4.dp)).padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }
            Text(
                if (isHighRisk) "Income Variance Detected" else "${applicant.aiConfidence}% AI Confidence",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.secondary,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Column(horizontalAlignment = Alignment.End) {
            Text("ID: ${applicant.id}", fontSize = 10.sp, color = MaterialTheme.colorScheme.secondary)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Review", fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun EddReviewScreen(navController: NavController, viewModel: AppViewModel, applicantId: String, state: AppState) {
    val applicant = state.applicants.find { it.id == applicantId } ?: return
    val coroutineScope = rememberCoroutineScope()
    var showToast by remember { mutableStateOf<String?>(null) }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
                .padding(bottom = 100.dp)
        ) {
            Text("Applicant Profile", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
            Text("${applicant.name} - ${applicant.occupation}", style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(24.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(24.dp))
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha=0.3f), RoundedCornerShape(24.dp))
                    .padding(16.dp)
            ) {
                Text("Onboarding Signals", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
                Spacer(modifier = Modifier.height(16.dp))
                applicant.signals.forEach { (key, value) ->
                    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(key, color = MaterialTheme.colorScheme.secondary)
                        Text(value, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Medium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(if (state.isDarkMode) DarkTertiary.copy(alpha=0.1f) else Color(0xFFFFF3E0), RoundedCornerShape(24.dp))
                    .border(1.dp, if (state.isDarkMode) DarkTertiary.copy(alpha=0.5f) else Color(0xFFFFCC80), RoundedCornerShape(24.dp))
                    .padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.SmartToy, contentDescription = null, tint = if (state.isDarkMode) DarkTertiary else Color(0xFFF57C00))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("AI Risk Profiling Judgment", style = MaterialTheme.typography.titleLarge, color = if (state.isDarkMode) DarkTertiary else Color(0xFFF57C00))
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    applicant.aiReasoning,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        // Sticky Bottom Bar
        Surface(
            modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth(),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 8.dp
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Button(
                    onClick = {
                        viewModel.updateApplicantStatus(applicant.id, "Approved", RiskLevel.LOW)
                        showToast = "Action simulated: Applicant ${applicant.name} moved to Approved Queue"
                        coroutineScope.launch { delay(2000); navController.popBackStack() }
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    shape = CircleShape,
                    colors = ButtonDefaults.buttonColors(containerColor = LeafGreen, contentColor = Color.White)
                ) {
                    Text("Approve (Prune & Clear)", fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            viewModel.updateApplicantStatus(applicant.id, "Escalated")
                            showToast = "Escalated to Senior Officer"
                            coroutineScope.launch { delay(2000); navController.popBackStack() }
                        },
                        modifier = Modifier.weight(1f).height(56.dp),
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary, contentColor = MaterialTheme.colorScheme.onPrimary)
                    ) {
                        Text("Escalate", fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            viewModel.updateApplicantStatus(applicant.id, "Rejected")
                            showToast = "Rejected Application"
                            coroutineScope.launch { delay(2000); navController.popBackStack() }
                        },
                        modifier = Modifier.weight(1f).height(56.dp),
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(containerColor = ErrorRed, contentColor = Color.White)
                    ) {
                        Text("Reject", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        
        AnimatedVisibility(visible = showToast != null, modifier = Modifier.align(Alignment.Center)) {
            Box(
                modifier = Modifier
                    .background(Color.Black.copy(alpha=0.8f), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text(showToast ?: "", color = Color.White, textAlign = TextAlign.Center)
            }
        }
    }
}
