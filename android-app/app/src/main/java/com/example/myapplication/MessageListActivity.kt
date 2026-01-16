package com.example.myapplication

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.myapplication.SocketManager.emitMarkMessageSeen
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.plus

data class ChatUser(
    val userId: String,
    val username: String,
    val profilePicture: String?,
    val lastMessage: String?,
    val createdAt: String,
    val online: Boolean = false,
    val lastSeen: String? = null
)

class MessageListActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MessageListScreen(
                    context = this,
                    onUserClick = { user ->
//                        navController.navigate("message/${user.userId}/${user.username}/${user.profilePicture}/${user.online}/${user.lastSeen}")
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessageListScreen(
    context: Context,
    onUserClick: (ChatUser) -> Unit
) {
    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
    val userId = prefs.getString("userId", "") ?: ""
    val profilePicture = prefs.getString("profilePicture", "").toString()

    var users by remember { mutableStateOf<List<ChatUser>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedMenuItem by remember { mutableStateOf("Messages") }
    val navController = rememberNavController()

    val profilePictureBitmap = remember {
        decodeBase64ToBitmap(profilePicture)
    }


    SocketManager.listenForEvents(
        onUserOnline = { userId ->
            users = users.map { user ->
                if (user.userId == userId)
                    user.copy(online = true)
                else
                    user
            }
        },
        onUserOffline = { userId, lastSeen ->
            users = users.map { user ->
                if (user.userId == userId)
                    user.copy(
                        online = false,
                        lastSeen = lastSeen // optional if your model has this field
                    )
                else
                    user
            }
        },
        onMessageReceived = { msgJson ->
            val userId = msgJson.getString("senderId")
            users = users.map { user ->
                if (user.userId == userId)
                    user.copy(
                        lastMessage = msgJson.optString("message",user.lastMessage)
                    )
                else
                    user
            }
        },
        onMessageSeen = { msgJson ->
//            Log.d("Msg", msgJson.toString())
        }
    )


    LaunchedEffect(userId) {
        if (userId.isNotEmpty()) {
            fetchUserChats(context, userId) { chatUsers ->
                users = chatUsers
                loading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Messages", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                val items = listOf("Home", "Search", "Add", "Messages", "Profile")

                items.forEach { item ->
                    NavigationBarItem(
                        icon = {
                            when (item) {
                                "Home" -> Icon(Icons.Filled.Home, contentDescription = "Home")
                                "Search" -> Icon(Icons.Filled.Search, contentDescription = "Search")
                                "Add" -> Icon(Icons.Filled.AddCircle, contentDescription = "Add")
                                "Messages" -> Icon(Icons.Filled.Message, contentDescription = "Messages")
                                "Profile" -> {
                                    if (profilePictureBitmap != null) {
                                        Image(
                                            bitmap = profilePictureBitmap.asImageBitmap(),
                                            contentDescription = "Profile",
                                            modifier = Modifier
                                                .size(24.dp)
                                                .clip(CircleShape),
                                            contentScale = ContentScale.Crop
                                        )
                                    } else {
                                        Icon(Icons.Filled.AccountCircle, contentDescription = "Profile")
                                    }
                                }
                            }
                        },
                        selected = selectedMenuItem == item,
                        onClick = {
                            selectedMenuItem = item

                            // ✅ Preserve state and avoid reload
                            navController.navigate(item.lowercase()) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true // keep state of previous destinations
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search...") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = "Search") },
                singleLine = true,
                shape = MaterialTheme.shapes.large
            )

            // Chat List
            if (loading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                val filteredUsers = users.filter {
                    it.username.contains(searchQuery, ignoreCase = true)
                }

                LazyColumn(
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredUsers) { user ->
                        ChatUserItem(
                            user = user,
                            onClick = { onUserClick(user) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ChatUserItem(user: ChatUser, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Profile Picture
        Box {
            val profileBitmap = user.profilePicture?.let { decodeBase64ToBitmap(it) }
            if (profileBitmap != null) {
                if(user.online){
                    Image(
                        bitmap = profileBitmap.asImageBitmap(),
                        contentDescription = "Profile",
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .border(2.dp, MaterialTheme.colorScheme.primary, CircleShape),
                        contentScale = ContentScale.Crop
                    )
                }else{
                    Image(
                        bitmap = profileBitmap.asImageBitmap(),
                        contentDescription = "Profile",
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                }
            } else {
                Icon(
                    Icons.Filled.AccountCircle,
                    contentDescription = "Profile",
                    modifier = Modifier.size(50.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // User Info
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = user.username,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = user.lastMessage ?: "No messages yet",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = getTimeAgo(user.createdAt),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp
                )
            }
        }
    }
    Divider()
}

suspend fun fetchUserChats(
    context: Context,
    userId: String,
    onResult: (List<ChatUser>) -> Unit
) {
    withContext(Dispatchers.IO) {
        try {
            val client = OkHttpClient.Builder()
                .cookieJar(PersistentCookieJar(context))
                .build()

            val request = Request.Builder()
                .url("https://backend-eror.onrender.com/chat/conversations/$userId")
                .get()
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val jsonResponse = response.body?.string()
                val jsonArray = JSONArray(jsonResponse ?: "[]")
                val chatUsers = mutableListOf<ChatUser>()

                for (i in 0 until jsonArray.length()) {
                    val jsonObject = jsonArray.getJSONObject(i)
                    chatUsers.add(
                        ChatUser(
                            userId = jsonObject.getString("userId"),
                            username = jsonObject.getString("username"),
                            profilePicture = jsonObject.optString("profilePicture", null),
                            lastMessage = jsonObject.optString("lastMessage", null),
                            createdAt = jsonObject.getString("createdAt"),
                            online = jsonObject.optBoolean("online", false),
                            lastSeen = jsonObject.optString("lastSeen", null)
                        )
                    )
                }

                withContext(Dispatchers.Main) {
                    onResult(chatUsers)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            withContext(Dispatchers.Main) {
                onResult(emptyList())
            }
        }
    }
}

fun getTimeAgo(timestamp: String): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val past = sdf.parse(timestamp) ?: return "Unknown"
        val now = Date()
        val diffInSeconds = (now.time - past.time) / 1000

        when {
            diffInSeconds < 60 -> "Just now"
            diffInSeconds < 3600 -> "${diffInSeconds / 60} min ago"
            diffInSeconds < 86400 -> "${diffInSeconds / 3600} hr ago"
            diffInSeconds < 604800 -> "${diffInSeconds / 86400} d ago"
            diffInSeconds < 2592000 -> "${diffInSeconds / 604800} w ago"
            diffInSeconds < 31536000 -> "${diffInSeconds / 2592000} mo ago"
            else -> "${diffInSeconds / 31536000} yr ago"
        }
    } catch (e: Exception) {
        "Unknown"
    }
}