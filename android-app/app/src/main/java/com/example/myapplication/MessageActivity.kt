package com.example.myapplication

import android.content.Context
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import androidx.compose.ui.graphics.Color
import com.example.myapplication.SocketManager.emitMarkMessageSeen

data class Message(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val message: String,
    val status: String, // sending, sent, delivered, seen
    val localId: String,
    val createdAt: String
)

class MessageActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val receiverUserId = intent.getStringExtra("userId") ?: ""
        val receiverUsername = intent.getStringExtra("username") ?: ""
        val receiverProfilePicture = intent.getStringExtra("profilePicture")
        val receiverOnline = intent.getBooleanExtra("online", false)
        val receiverLastSeen = intent.getStringExtra("lastSeen")

        setContent {
            MaterialTheme {
                MessageScreen(
                    context = this,
                    receiverUserId = receiverUserId,
                    receiverUsername = receiverUsername,
                    receiverProfilePicture = receiverProfilePicture,
                    receiverOnline = receiverOnline,
                    receiverLastSeen = receiverLastSeen,
                    onBack = { finish() }
                )
            }
        }
    }

}
    @OptIn(ExperimentalMaterial3Api::class)
    @Preview
    @Composable
    fun MessageScreen(
        context: Context,
        receiverUserId: String,
        receiverUsername: String,
        receiverProfilePicture: String?,
        receiverOnline: Boolean,
        receiverLastSeen: String?,
        onBack: () -> Unit
    ) {
        val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        val userId = prefs.getString("userId", "") ?: ""

        var messages by remember { mutableStateOf<List<Message>>(emptyList()) }
        var newMessage by remember { mutableStateOf("") }
        var loading by remember { mutableStateOf(true) }
        var receiverLastSeen by remember { mutableStateOf(receiverLastSeen) }
        var receiverOnline by remember { mutableStateOf(receiverOnline) }
        var sendingMessage by remember { mutableStateOf(false) }
        var existingMessageId by remember { mutableStateOf("gopi") }
        val scope = rememberCoroutineScope()
        val listState = rememberLazyListState()
//    SocketManager.connect(context)

        SocketManager.listenForEvents(
            onUserOnline = { userId ->
                if(userId == receiverUserId){
                    receiverOnline = true
                }
            },
            onUserOffline = { userId, lastSeen ->
                if(userId == receiverUserId){
                    receiverLastSeen = lastSeen
                }
            },
            onMessageReceived = { msgJson ->
                val sender = msgJson.getString("senderId")
                if (sender.toString() == receiverUserId && existingMessageId != msgJson.getString("_id").toString()) {
                    existingMessageId = msgJson.getString("_id").toString()
                    val newMessage = Message(
                        id = msgJson.getString("_id"),
                        senderId = msgJson.getString("senderId"),
                        receiverId = msgJson.getString("receiverId"),
                        message = msgJson.getString("message"),
                        status = msgJson.optString("status", "sent"),
                        localId = msgJson.getString("_id"),
                        createdAt = msgJson.optString(
                            "createdAt",
                            java.text.SimpleDateFormat(
                                "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                                java.util.Locale.getDefault()
                            )
                                .format(java.util.Date())
                        )
                    )

                    messages = messages + newMessage

                    emitMarkMessageSeen(msgJson)
                }
            },
            onMessageSeen = { msgJson ->
                val seenMessageText = msgJson.optString("message")
                val senderId = msgJson.optString("senderId")
                val receiverId = msgJson.optString("receiverId")

                val mutableMessages = messages.toMutableList()

                for (i in mutableMessages.lastIndex downTo 0) {
                    val msg = mutableMessages[i]

                    if (
                        msg.message == seenMessageText &&
                        msg.senderId == senderId &&
                        msg.receiverId == receiverId
                    ) {
                        Log.d("Msg Seen", "Got it → ${msg.id}")
                        mutableMessages[i] = msg.copy(status = "seen")
                        break
                    }
                }

                messages = mutableMessages
            }


        )

        // Fetch messages on load
        LaunchedEffect(receiverUserId) {
            fetchMessages(context, userId, receiverUserId, 1) { fetchedMessages ->
                messages = fetchedMessages
                loading = false
            }
        }

        // Auto-scroll to bottom when new messages arrive
        LaunchedEffect(messages.size) {
            if (messages.isNotEmpty()) {
                listState.animateScrollToItem(messages.size - 1)
            }
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            val profileBitmap =
                                receiverProfilePicture?.let { decodeBase64ToBitmap(it) }
                            if (profileBitmap != null) {
                                Image(
                                    bitmap = profileBitmap.asImageBitmap(),
                                    contentDescription = "Profile",
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Icon(
                                    Icons.Filled.AccountCircle,
                                    contentDescription = "Profile",
                                    modifier = Modifier.size(40.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(receiverUsername, fontWeight = FontWeight.Bold)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(
                                                if (receiverOnline) MaterialTheme.colorScheme.primary
                                                else MaterialTheme.colorScheme.secondary
                                            )
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = if (receiverOnline) "Online"
                                        else receiverLastSeen?.let { getTimeAgo(it) } ?: "Offline",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        IconButton(onClick = { /* Handle call */ }) {
                            Icon(Icons.Filled.Call, contentDescription = "Call")
                        }
                        IconButton(onClick = { /* Handle video call */ }) {
                            Icon(Icons.Filled.Videocam, contentDescription = "Video Call")
                        }
                    }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Messages List
                if (loading) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        state = listState
                    ) {
                        items(messages) { message ->
                            MessageBubble(
                                message = message,
                                isOwnMessage = message.senderId == userId
                            )
                        }
                    }
                }

                // Message Input
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = newMessage,
                        onValueChange = { newMessage = it },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text("Type a message...") },
                        shape = RoundedCornerShape(24.dp),
                        maxLines = 4
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = {
                            if (newMessage.isNotBlank() && !sendingMessage) {
                                sendingMessage = true
                                scope.launch {
                                    sendMessage(
                                        context = context,
                                        senderId = userId,
                                        receiverId = receiverUserId,
                                        message = newMessage
                                    ) { sentMessage ->
                                        if (sentMessage != null) {
                                            messages = messages + sentMessage
                                            newMessage = ""
                                        }
                                        sendingMessage = false
                                    }
                                }
                            }
                        },
                        enabled = newMessage.isNotBlank() && !sendingMessage
                    ) {
                        if (sendingMessage) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp))
                        } else {
                            Icon(Icons.Filled.Send, contentDescription = "Send")
                        }
                    }
                }
            }
        }
    }

    @Composable
    fun MessageBubble(message: Message, isOwnMessage: Boolean) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp),
            horizontalAlignment = if (isOwnMessage) Alignment.End else Alignment.Start
        ) {
            Box(
                modifier = Modifier
                    .widthIn(max = 280.dp)
                    .background(
                        color = if (isOwnMessage) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(12.dp)
                    )
                    .padding(12.dp)
            ) {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = message.message,
                        color = if (isOwnMessage) MaterialTheme.colorScheme.onPrimary
                        else MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    if (isOwnMessage) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = when (message.status) {
                                "sending" -> Icons.Filled.Schedule
                                "sent" -> Icons.Filled.Done
                                "delivered" -> Icons.Filled.DoneAll
                                "seen" -> Icons.Filled.DoneAll
                                else -> Icons.Filled.Schedule
                            },
                            contentDescription = message.status,
                            modifier = Modifier.size(16.dp),
                            tint =  when (message.status) {
                                "seen" -> Color(0xFF1E88E5)  // ✅ Blue for seen
                                "sent", "delivered" -> Color.White  // ✅ White for sent/delivered
                                else -> Color.Gray  // Optional: gray for pending/sending
                            }
                        )
                    }
                }
            }

            Text(
                text = getTimeAgo(message.createdAt),
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
            )
        }
    }

    suspend fun fetchMessages(
        context: Context,
        senderId: String,
        receiverId: String,
        page: Int,
        onResult: (List<Message>) -> Unit
    ) {
        withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder()
                    .cookieJar(PersistentCookieJar(context))
                    .build()

                val request = Request.Builder()
                    .url("https://backend-eror.onrender.com/chat/messages?senderId=$senderId&receiverId=$receiverId&page=$page&limit=50")
                    .get()
                    .build()

                val messagesList = mutableListOf<Message>()

                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val jsonResponse = response.body?.string()
                    val jsonObject = JSONObject(jsonResponse ?: "{}")
                    val messagesArray = jsonObject.getJSONArray("messages")

                    for (i in 0 until messagesArray.length()) {
                        val msgObject = messagesArray.getJSONObject(i)
                        messagesList.add(
                            Message(
                                id = msgObject.getString("_id"),
                                senderId = msgObject.getString("senderId"),
                                receiverId = msgObject.getString("receiverId"),
                                message = msgObject.getString("message"),
                                status = msgObject.optString("status", "sent"),
                                createdAt = msgObject.getString("createdAt"),
                                localId = msgObject.getString("_id")
                            )
                        )
                    }

                    withContext(Dispatchers.Main) {
                        onResult(messagesList)
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

    suspend fun sendMessage(
        context: Context,
        senderId: String,
        receiverId: String,
        message: String,
        onResult: (Message?) -> Unit
    ) {
        withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient.Builder()
                    .cookieJar(PersistentCookieJar(context))
                    .build()

                val jsonBody = JSONObject().apply {
                    put("senderId", senderId)
                    put("receiverId", receiverId)
                    put("message", message)
                }

                val body = jsonBody.toString().toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url("https://backend-eror.onrender.com/chat/send")
                    .post(body)
                    .build()

                val response = client.newCall(request).execute()
                if (response.code == 201) {
                    val jsonResponse = JSONObject(response.body?.string() ?: "{}")
                    val msgData = jsonResponse.optJSONObject("message") ?: jsonBody
                    val sampleId = System.currentTimeMillis().toString()
                    val sentMessage = Message(
                        id = msgData.optString("_id", sampleId),
                        senderId = senderId,
                        receiverId = receiverId,
                        message = message,
                        status = msgData.optString("status", "sent"),
                        createdAt = msgData.optString(
                            "createdAt",
                            java.text.SimpleDateFormat(
                                "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                                java.util.Locale.getDefault()
                            )
                                .format(java.util.Date())
                        ),
                        localId = sampleId
                    )

                    // ✅ Emit message through socket
                    SocketManager.emitSendMessage(msgData)

                    withContext(Dispatchers.Main) {
                        onResult(sentMessage)
                    }
                } else {
                    withContext(Dispatchers.Main) { onResult(null) }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) { onResult(null) }
            }
        }
    }

