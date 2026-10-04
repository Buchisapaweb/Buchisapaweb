package com.example.buchisapa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.buchisapa.ui.navigation.Screen
import com.example.buchisapa.ui.screens.*
import com.example.buchisapa.ui.theme.BuchisapaTheme
import com.example.buchisapa.ui.theme.DarkBg
import com.example.buchisapa.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        val app = application as BuchisapaApplication
        MainViewModel.Factory(app.repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            BuchisapaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkBg
                ) {
                    BuchisapaAppNav(viewModel = viewModel)
                }
            }
        }
    }
}

@Composable
fun BuchisapaAppNav(viewModel: MainViewModel) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                onNavigateToOrders = { navController.navigate(Screen.OrdersTracker.route) },
                onNavigateToAdmin = { navController.navigate(Screen.AdminPanel.route) },
                onNavigateToInfo = { navController.navigate(Screen.Nosotros.route) },
                onNavigateToClaims = { navController.navigate(Screen.LibroReclamaciones.route) }
            )
        }

        composable(Screen.Cart.route) {
            CartScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCheckout = { navController.navigate(Screen.Checkout.route) }
            )
        }

        composable(Screen.Checkout.route) {
            CheckoutScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onOrderPlaced = { order ->
                    navController.navigate(Screen.OrderSuccess.createRoute(order.id)) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                }
            )
        }

        composable(
            route = Screen.OrderSuccess.route,
            arguments = listOf(navArgument("orderId") { type = NavType.StringType })
        ) { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
            OrderSuccessScreen(
                orderId = orderId,
                viewModel = viewModel,
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onNavigateToTracker = {
                    navController.navigate(Screen.OrdersTracker.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                }
            )
        }

        composable(Screen.OrdersTracker.route) {
            OrdersTrackerScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.LibroReclamaciones.route) {
            ClaimsScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminPanel.route) {
            AdminScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Nosotros.route) {
            InfoScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToClaims = { navController.navigate(Screen.LibroReclamaciones.route) }
            )
        }
    }
}
