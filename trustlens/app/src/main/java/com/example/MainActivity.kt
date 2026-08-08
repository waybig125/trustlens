package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val state by viewModel.uiState.collectAsState()
            
            AppTheme(darkTheme = state.isDarkMode) {
                val navController = rememberNavController()
                
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = { AppHeader(viewModel, state) }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "welcome",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("welcome") {
                            WelcomeScreen(navController, state)
                        }
                        composable("applicant_form") {
                            ApplicantFormScreen(navController, viewModel)
                        }
                        composable("applicant_status") {
                            ApplicantStatusScreen(navController, state)
                        }
                        composable("officer_dashboard") {
                            OfficerDashboardScreen(navController, state)
                        }
                        composable("edd_review/{id}") { backStackEntry ->
                            val id = backStackEntry.arguments?.getString("id")
                            if (id != null) {
                                EddReviewScreen(navController, viewModel, id, state)
                            }
                        }
                    }
                }
            }
        }
    }
}
