package com.example.myapplication

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

// ---------- GLOBAL HTTP CLIENT WITH PERSISTENT COOKIE JAR ----------
lateinit var cookieClient: OkHttpClient

class SignInActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize global OkHttpClient with persistent cookies
        cookieClient = OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(this))
            .build()

        setContent {
            AppTheme {
                SignInScreen(this)
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

// ---------- SIGN-IN SCREEN ----------
@Preview
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignInScreen(context: Context) {
    var passwordVisible by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    fun showSnack(message: String) {
        scope.launch { snackbarHostState.showSnackbar(message) }
    }


    fun signIn() {
        if (email.isBlank() || password.isBlank()) {
            showSnack("Enter Email and Password")
            return
        }

        val jsonBody = JSONObject()
            .put("email", email)
            .put("password", password)
            .toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("https://backend-eror.onrender.com/login")
            .post(jsonBody)
            .build()

        cookieClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                scope.launch { snackbarHostState.showSnackbar("Network Error") }
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val body = response.body?.string()
                    val userJson = JSONObject(body ?: "{}")

                    // Save user info
                    prefs.edit().apply {
                        putString("userId", userJson.optString("userId"))
                        putString("email", userJson.optString("email"))
                        putString("name", userJson.optString("name"))
                        putString("profilePicture",userJson.optString("profilePicture"))
                        apply()
                    }

                    CoroutineScope(Dispatchers.Main).launch {
                        SocketManager.connect(this@SignInActivity)
                    }

                    scope.launch {
                        snackbarHostState.showSnackbar("Login Successful")
                        // Navigate to HomeActivity
                        val intent = Intent(context, HomeActivity::class.java)
                        context.startActivity(intent)
                        (context as? Activity)?.finish()
                    }
                } else {
//                    val msg = response.body?.string() ?: "Email or Password Mismatch"
                    val msg = "Email or Password Mismatch"
                    scope.launch { snackbarHostState.showSnackbar(msg) }
                }
            }
        })
    }

    // ---------- UI ----------
    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "Logo",
                modifier = Modifier.size(160.dp)
            )

            Spacer(Modifier.height(16.dp))
            Text("Sign In", fontSize = 22.sp, color = MaterialTheme.colorScheme.onBackground)

            Spacer(Modifier.height(16.dp))
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
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
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

            Spacer(Modifier.height(20.dp))
            Button(
                onClick = { signIn() },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7b6cc2))
            ) {
                Text("Sign In", color = Color.White)
            }

            Spacer(Modifier.height(12.dp))
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Don't have an account?")
                TextButton(onClick = {
                    // TODO: navigate to SignUpActivity
                    navigateTo(SignUpActivity::class.java)
                }) {
                    Text("Sign Up")
                }
            }
        }
    }
}
}
