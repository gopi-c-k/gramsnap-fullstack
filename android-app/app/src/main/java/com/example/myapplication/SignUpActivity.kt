package com.example.myapplication

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.ui.res.painterResource
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.ui.text.input.VisualTransformation

class SignUpActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                SignUpScreen()
            }
        }
    }

    @Composable
    fun AppTheme(
        darkTheme: Boolean = isSystemInDarkTheme(),
        content: @Composable () -> Unit
    ) {
        val colors = if (darkTheme) {
            darkColorScheme(
                background = Color.Black,
                surface = Color.Black,
                onBackground = Color.White,
                onSurface = Color.White
            )
        } else {
            lightColorScheme(
                background = Color.White,
                surface = Color.White,
                onBackground = Color.Black,
                onSurface = Color.Black
            )
        }

        MaterialTheme(
            colorScheme = colors,
            content = content
        )
    }

    private fun navigateTo(target: Class<out Activity>) {
        runOnUiThread {
            val intent = Intent(this, target)
            startActivity(intent)
            finish() // prevent returning to MainActivity
        }
    }


    @OptIn(ExperimentalMaterial3Api::class)
    @Preview
    @Composable
    fun SignUpScreen() {
        val snackbarHostState = remember { SnackbarHostState() }
        val scope = rememberCoroutineScope()

        var passwordVisible by remember { mutableStateOf(false) }
        var confirmPasswordVisible by remember { mutableStateOf(false) }

        var name by remember { mutableStateOf("") }
        var email by remember { mutableStateOf("") }
        var password by remember { mutableStateOf("") }
        var confirmPassword by remember { mutableStateOf("") }
        var otp by remember { mutableStateOf("") }
        var userId by remember { mutableStateOf("") }

        var isOTPSent by remember { mutableStateOf(false) }
        var timer by remember { mutableStateOf(0) }
        var resendEnabled by remember { mutableStateOf(false) }

        fun showSnack(msg: String) {
            scope.launch {
                snackbarHostState.showSnackbar(
                    message = msg,
                    duration = SnackbarDuration.Short,
                    withDismissAction = true
                )
            }
        }

        fun sendOTP() {
            scope.launch(Dispatchers.IO) {
                val client = OkHttpClient()
                val body = JSONObject().put("email", email).toString()
                    .toRequestBody("application/json".toMediaType())
                val req = Request.Builder()
                    .url("https://backend-eror.onrender.com/sendOTP")
                    .post(body)
                    .build()

                try {
                    val response = client.newCall(req).execute()
                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            isOTPSent = true
                            timer = 120
                            resendEnabled = false
                            showSnack("OTP sent to $email")
                        } else {
                            showSnack("Failed to send OTP")
                        }
                    }
                } catch (e: IOException) {
                    withContext(Dispatchers.Main) {
                        showSnack("Network Error")
                    }
                }
            }
        }

        fun signUp() {
            scope.launch(Dispatchers.IO) {
                val client = OkHttpClient()
                val body = JSONObject()
                    .put("name", name)
                    .put("email", email)
                    .put("password", password)
                    .put("otp", otp)
                    .put("userId", userId)
                    .toString()
                    .toRequestBody("application/json".toMediaType())

                val req = Request.Builder()
                    .url("https://backend-eror.onrender.com/signup")
                    .post(body)
                    .build()

                try {
                    val response = client.newCall(req).execute()
                    withContext(Dispatchers.Main) {
                        if (response.code == 201) {
                            showSnack("Account created successfully!")
                        } else {
                            val msg = response.body?.string() ?: "Error occurred"
                            showSnack(msg)
                        }
                    }
                } catch (e: IOException) {
                    withContext(Dispatchers.Main) {
                        showSnack("Network Error")
                    }
                }
            }
        }

        // Timer logic
        LaunchedEffect(timer) {
            if (timer > 0 && !resendEnabled) {
                delay(1000)
                timer--
                if (timer == 0) resendEnabled = true
            }
        }

        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) }
        ) { padding ->
            Row(
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center,

                ) {
                    Crossfade(targetState = isOTPSent, label = "otp_crossfade") { showOtp ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Top,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.logo),
                                contentDescription = "Logo",
                                modifier = Modifier.size(180.dp)
                            )

                            Spacer(Modifier.height(16.dp))
                            Text(
                                if (!showOtp) "Create Account" else "Verify OTP",
                                style = MaterialTheme.typography.titleMedium
                            )

                            Spacer(Modifier.height(16.dp))

                            if (!showOtp) {
                                OutlinedTextField(
                                    value = name,
                                    onValueChange = { name = it },
                                    label = { Text("Name") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    label = { Text("Email") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = password,
                                    onValueChange = { password = it },
                                    label = { Text("Password") },
                                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    trailingIcon = {
                                        val image = if (passwordVisible)
                                            Icons.Filled.VisibilityOff
                                        else
                                            Icons.Filled.Visibility

                                        val description = if (passwordVisible) "Hide password" else "Show password"

                                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                            Icon(
                                                imageVector = image,
                                                contentDescription = description,
                                                tint = MaterialTheme.colorScheme.onBackground
                                            )
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = confirmPassword,
                                    onValueChange = { confirmPassword = it },
                                    label = { Text("Confirm Password") },
                                    visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    trailingIcon = {
                                        val image = if (confirmPasswordVisible)
                                            Icons.Filled.VisibilityOff
                                        else
                                            Icons.Filled.Visibility

                                        val description = if (confirmPasswordVisible) "Hide password" else "Show password"

                                        IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                                            Icon(
                                                imageVector = image,
                                                contentDescription = description,
                                                tint = MaterialTheme.colorScheme.onBackground
                                            )
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Spacer(Modifier.height(16.dp))
                                Button(
                                    onClick = {
                                        val passPattern =
                                            Regex("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@\$!%*?&])[A-Za-z\\d@\$!%*?&]{8,}$")
                                        when {
                                            !passPattern.matches(password) -> showSnack("Weak password")
                                            password != confirmPassword -> showSnack("Passwords don't match")
                                            !email.contains("@") -> showSnack("Invalid email")
                                            else -> sendOTP()
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Create Account")
                                }

                                Spacer(Modifier.height(12.dp))
                                Row(
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Already have an account?")
                                    TextButton(onClick = {
                                        // TODO: navigate to SignUpActivity
                                        navigateTo(SignInActivity::class.java)
                                    }) {
                                        Text("Sign In")
                                    }
                                }
                            } else {
                                OutlinedTextField(
                                    value = otp,
                                    onValueChange = { otp = it },
                                    label = { Text("OTP") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = userId,
                                    onValueChange = { userId = it },
                                    label = { Text("User ID") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(Modifier.height(8.dp))
                                TextButton(
                                    onClick = { if (resendEnabled) sendOTP() },
                                    enabled = resendEnabled
                                ) {
                                    Text(
                                        if (resendEnabled) "Resend OTP"
                                        else "Resend in ${timer}s"
                                    )
                                }
                                Spacer(Modifier.height(8.dp))
                                Button(
                                    onClick = { signUp() },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Verify OTP")
                                }
                            }
                        }
                    }
                }
            }
        }

    }
}