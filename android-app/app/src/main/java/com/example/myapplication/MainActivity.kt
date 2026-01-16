package com.example.myapplication

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.RequestBody.Companion.toRequestBody
import androidx.compose.ui.graphics.Color

class MainActivity : ComponentActivity() {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                MainPage()
            }
        }
        // Initialize global cookie client using persistent cookie jar
        cookieClient = OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(this))
            .build()

        // Check login status immediately
        checkAutoLogin()
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
    private fun checkAutoLogin() {
        val request = Request.Builder()
            .url("https://backend-eror.onrender.com/login-refresh")
            .post(ByteArray(0).toRequestBody(null))
            .build()

        scope.launch {
            try {
                val response = cookieClient.newCall(request).execute()
                if (response.isSuccessful) {
                    CoroutineScope(Dispatchers.Main).launch {
                        SocketManager.connect(this@MainActivity)
                    }
                    navigateTo(HomeActivity::class.java)
                } else {
                    navigateTo(SignUpActivity::class.java)
                }
            } catch (e: Exception) {
                navigateTo(SignInActivity::class.java)
            }
        }
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
    fun MainPage(){
        Scaffold { padding ->
            Row(modifier = Modifier
                .fillMaxSize()
                .padding(padding)) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.logo),
                            contentDescription = "Logo",
                            modifier = Modifier.size(200.dp)
                        )
                    }

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Bottom,
                        modifier = Modifier
                            .fillMaxSize()
                    ) {
                        Text(text = "Done & Dusted By")
                        Text(text = "Gopika A Gopi C K Sree Ram S")
                    }

                }
            }
        }
    }
}
