package com.example.myapplication

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class NotificationActivity : ComponentActivity() {

    private val viewModel: NotificationViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AppTheme {
                NotificationScreen(viewModel = viewModel, onBack = {
                    startActivity(Intent(this, HomeActivity::class.java))
                    finish()
                })
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
}

@OptIn(ExperimentalMaterial3Api::class)
@Preview
@Composable
fun NotificationScreen(viewModel: NotificationViewModel, onBack: () -> Unit) {
    val notifications by viewModel.notifications.collectAsState()
    val suggestedUsers by viewModel.recommendedUsers.collectAsState()
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        viewModel.fetchNotifications(context)
        viewModel.fetchRecommendedUsers(context)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // 🔔 Notifications
            Text("Notifications", style = MaterialTheme.typography.titleLarge)
            if (notifications.isEmpty()) {
                Text("No Notifications")
            } else {
                notifications.forEach { notification ->
                    NotificationItem(
                        notification = notification,
                        onConfirm = { viewModel.acceptFollowRequest(notification.senderId.userId, context) },
                        onUserClick = { /* Implement if needed */ }
                    )
                }
            }

            Divider(modifier = Modifier.padding(vertical = 16.dp))

            // 👥 Suggestions
            Text("People You May Know", style = MaterialTheme.typography.titleLarge)
            suggestedUsers.forEach { user ->
                SuggestedUserItem(user = user, onUserClick = { /* Implement if needed */ })
            }
        }
    }
}

@Composable
fun NotificationItem(
    notification: Notification,
    onConfirm: () -> Unit,
    onUserClick: () -> Unit
) {
    val profileBitmap = remember(notification.senderId.profilePicture) {
        decodeBase64ToBitmap(notification.senderId.profilePicture)
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .clickable { onUserClick() }
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if(profileBitmap != null ){
            Image(bitmap = profileBitmap.asImageBitmap(), contentDescription = null,
                modifier = Modifier.size(40.dp).clip(CircleShape))
        }

        Spacer(Modifier.width(8.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                buildAnnotatedString {
                    withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                        append(notification.senderId.name)
                    }
                    append(" ${notification.message}")
                }
            )
        }

        when (notification.type) {
            "like" -> Icon(Icons.Default.Favorite, contentDescription = null, tint = Color.Red)
            "follow" -> Icon(Icons.Default.Person, contentDescription = null, tint = Color.Green)
            "comment" -> Icon(Icons.Default.Comment, contentDescription = null, tint = Color.Blue)
            "followRequest" -> {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.PersonAdd, contentDescription = null)
                    Spacer(Modifier.width(4.dp))
                    Button(onClick = onConfirm) {
                        Text("Confirm")
                    }
                }
            }
        }
    }
}

@Composable
fun SuggestedUserItem(user: User, onUserClick: () -> Unit) {
    val profileBitmap = remember(user.profilePicture) {
        decodeBase64ToBitmap(user.profilePicture)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .clickable { onUserClick() }
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if(profileBitmap != null ) {
            Image(bitmap = profileBitmap.asImageBitmap(), contentDescription = null,
                modifier = Modifier.size(40.dp).clip(CircleShape))
        }

        Spacer(Modifier.width(8.dp))

        Text(user.name, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))

        val context = LocalContext.current
        val scope = rememberCoroutineScope()

        Button(onClick = { /* Implement follow logic */
            scope.launch {
                val result = sendFollowRequest(context, user.userId)
                result.onSuccess { message ->
                    Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
                }.onFailure { error ->
                    Toast.makeText(context, "Error: ${error.message}", Toast.LENGTH_LONG).show()
                    Log.e("FollowRequest", "Failed", error)
                }
            }
            }) {
            Icon(Icons.Default.PersonAdd, contentDescription = null)
            Text(" Follow", modifier = Modifier.padding(start = 4.dp))
        }
    }
}


suspend fun sendFollowRequest(context: Context, followRequestUserId: String): Result<String> {
    return withContext(Dispatchers.IO) {
        try {
            val client = OkHttpClient.Builder()
                .cookieJar(PersistentCookieJar(context))
                .build()

            val json = JSONObject()
            json.put("followRequestUserId", followRequestUserId)

            val requestBody = json.toString().toRequestBody("application/json".toMediaType())

            val request = Request.Builder()
                .url("https://backend-eror.onrender.com/followRequest")
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string()

            if (response.isSuccessful && body != null) {
                Result.success(JSONObject(body).getString("message"))
            } else {
                Result.failure(Exception("Failed: ${response.code} - $body"))
            }

        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

fun decodeBase64ToBitmap(base64String: String?): Bitmap? {
    if (base64String.isNullOrEmpty()) return null
    return try {
        val cleanBase64 =
            base64String.substringAfter(",") // remove "data:image/png;base64," if present
        val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
        BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
    } catch (e: Exception) {
        Log.e("DecodeBase64", "Failed to decode base64 image: ${e.message}")
        null
    }
}

class NotificationViewModel : ViewModel() {
    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()

    private val _recommendedUsers = MutableStateFlow<List<User>>(emptyList())
    val recommendedUsers: StateFlow<List<User>> = _recommendedUsers.asStateFlow()

    private val baseUrl = "https://backend-eror.onrender.com"

    fun fetchNotifications(context: Context) {

        val client = OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(context))
            .build()

        val request = Request.Builder()
            .url("$baseUrl/notifications")
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("NotificationViewModel", "Failed to fetch notifications", e)
            }

            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { body ->
                    try {
                        val jsonArray = JSONArray(body)
                        val result = mutableListOf<Notification>()
                        for (i in 0 until jsonArray.length()) {
                            val obj = jsonArray.getJSONObject(i)
                            result.add(Notification.fromJson(obj))
                        }
                        viewModelScope.launch(Dispatchers.Main) {
                            _notifications.value = result
                        }
                    } catch (e: Exception) {
                        Log.e("NotificationViewModel", "Error parsing notifications", e)
                    }
                }
            }
        })
    }

    fun fetchRecommendedUsers(context : Context) {
        val client = OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(context))
            .build()
        val request = Request.Builder()
            .url("$baseUrl/suggestions")
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("NotificationViewModel", "Failed to fetch users", e)
            }

            override fun onResponse(call: Call, response: Response) {
                response.body?.string()?.let { body ->
                    try {
                        val suggestions = JSONObject(body).getJSONArray("suggestions")
                        val result = mutableListOf<User>()
                        for (i in 0 until suggestions.length()) {
                            val obj = suggestions.getJSONObject(i)
                            result.add(User.fromJson(obj))
                        }
                        viewModelScope.launch(Dispatchers.Main) {
                            _recommendedUsers.value = result
                        }
                    } catch (e: Exception) {
                        Log.e("NotificationViewModel", "Error parsing users", e)
                    }
                }
            }
        })
    }

    fun acceptFollowRequest(senderId: String, context : Context) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val json = JSONObject().put("senderId", senderId).toString()
                val body = RequestBody.create("application/json".toMediaTypeOrNull(), json)
                val client = OkHttpClient.Builder()
                    .cookieJar(PersistentCookieJar(context))
                    .build()
                val request = Request.Builder()
                    .url("$baseUrl/accept-follow")
                    .post(body)
                    .build()

                client.newCall(request).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e("NotificationViewModel", "Failed to accept follow", e)
                    }

                    override fun onResponse(call: Call, response: Response) {
                        fetchNotifications(context)
                    }
                })
            } catch (e: Exception) {
                Log.e("NotificationViewModel", "Error accepting follow request", e)
            }
        }
    }
}

data class User(
    val userId: String,
    val name: String,
    val profilePicture: String
) {
    companion object {
        fun fromJson(json: JSONObject): User {
            return User(
                userId = json.getString("userId"),
                name = json.getString("name"),
                profilePicture = json.getString("profilePicture")
            )
        }
    }
}

data class Notification(
    val _id: String,
    val type: String,
    val message: String,
    val senderId: User
) {
    companion object {
        fun fromJson(json: JSONObject): Notification {
            return Notification(
                _id = json.getString("_id"),
                type = json.getString("type"),
                message = json.getString("message"),
                senderId = User.fromJson(json.getJSONObject("senderId"))
            )
        }
    }
}