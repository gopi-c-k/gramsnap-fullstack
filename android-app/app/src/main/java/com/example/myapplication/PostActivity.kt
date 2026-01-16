package com.example.myapplication

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.compose.ui.unit.Dp
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.ui.tooling.preview.Preview
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
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.sql.Time
import java.text.SimpleDateFormat
import java.time.LocalTime
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class Posts(
    val postId: String,
    val postUserId: String,
    val username: String,
    val profilePic: String?,
    val image: String,
    val title: String,
    val likes: Int,
    val isLiked: Boolean,
    val isSaved: Boolean
)

data class CommentsOfPost(
    val id: String,
    val text: String,
    val createdAt: String,
    val userId: String,
    val profilePicture: String?
)

class PostActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val postId = extractPostIdFromIntent(intent)
        setContent {
            PostAppTheme {
                if (postId != null) {
                    PostScreen(postId)
                } else {
                    LaunchedEffect(Unit) {
                        val intent = Intent(this@PostActivity, MainActivity::class.java)
                        startActivity(intent)
                        finish()
                    }
                }
            }
        }
    }

    private fun extractPostIdFromIntent(intent: Intent): String? {
        val data: Uri? = intent.data
        data?.let {
            val pathSegments = it.pathSegments
            if (pathSegments.size >= 2 && pathSegments[0] == "post") {
                return pathSegments[1]
            }
        }
        return null
    }
}

@Composable
fun PostAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) {
        darkColorScheme(
            background = Color(0xFF121212),
            surface = Color(0xFF1E1E1E),
            onBackground = Color.White,
            onSurface = Color.White,
            primary = Color(0xFFBB86FC)
        )
    } else {
        lightColorScheme(
            background = Color.White,
            surface = Color(0xFFF5F5F5),
            onBackground = Color.Black,
            onSurface = Color.Black,
            primary = Color(0xFF6200EE)
        )
    }

    MaterialTheme(
        colorScheme = colors,
        content = content
    )
}

fun Modifier.shimmerEffect(): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val offsetX by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmer_offset"
    )

    val isDark = isSystemInDarkTheme()
    val shimmerColors = if (isDark) {
        listOf(
            Color(0xFF2C2C2C),
            Color(0xFF3A3A3A),
            Color(0xFF2C2C2C)
        )
    } else {
        listOf(
            Color(0xFFE0E0E0),
            Color(0xFFF5F5F5),
            Color(0xFFE0E0E0)
        )
    }

    this.background(
        Brush.linearGradient(
            colors = shimmerColors,
            start = Offset(offsetX, 0f),
            end = Offset(offsetX + 500f, 500f)
        )
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Preview
@Composable
fun PostScreen(postId: String,navController : NavController? = null) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)

    var post by remember { mutableStateOf<Posts?>(null) }
    var comments by remember { mutableStateOf<List<CommentsOfPost>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var hasError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var commentText by remember { mutableStateOf("") }

    val client = remember {
        OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(context))
            .build()
    }

    val baseUrl = "https://backend-eror.onrender.com"

    // Fetch post + comments on first load
    LaunchedEffect(postId) {
        withContext(Dispatchers.IO) {
            try {
                isLoading = true
                hasError = false

                // Fetch post
                val postRequest = Request.Builder()
                    .url("$baseUrl/post/$postId")
                    .get()
                    .build()
                val postResponse = client.newCall(postRequest).execute()

                if (postResponse.isSuccessful) {
                    val postJson = JSONObject(postResponse.body?.string() ?: "{}")


                    withContext(Dispatchers.Main) {
                        post = Posts(
                            postId = postJson.getString("_id"),
                            postUserId = postJson.getString("userId"),
                            username = postJson.getString("username"),
                            profilePic = postJson.getString("profilePic"),
                            image = postJson.getString("image"),
                            title = postJson.getString("title"),
                            likes = postJson.getInt("likes"),
                            isLiked = postJson.getBoolean("isLiked"),
                            isSaved = postJson.getBoolean("isSaved")
                        )
                    }

                    // Fetch comments
                    val commentsRequest = Request.Builder()
                        .url("$baseUrl/post/$postId/comment")
                        .get()
                        .build()
                    val cookieClient = OkHttpClient.Builder()
                        .cookieJar(PersistentCookieJar(context))
                        .build()
                    val commentsResponse = cookieClient.newCall(commentsRequest).execute()

                    if (commentsResponse.isSuccessful) {
                        val commentsJson = JSONObject(commentsResponse.body?.string() ?: "{}")
                        Log.d("Comment Response",commentsJson.toString())
                        val commentsArray = commentsJson.getJSONArray("comments")
                        val commentsList = mutableListOf<CommentsOfPost>()

                        for (i in 0 until commentsArray.length()) {
                            val commentObj = commentsArray.getJSONObject(i)
                            val userObj = commentObj.getJSONObject("userId")

                            commentsList.add(
                                CommentsOfPost(
                                    id = commentObj.getString("_id"),
                                    text = commentObj.getString("text"),
                                    createdAt = commentObj.getString("createdAt"),
                                    userId = userObj.getString("userId"),
                                    profilePicture = userObj.optString("profilePicture", "")
                                )
                            )
                        }

                        withContext(Dispatchers.Main) {
                            comments = commentsList
                            isLoading = false
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        hasError = true
                        isLoading = false
                        errorMessage = when (postResponse.code) {
                            404 -> "Post not found"
                            403 -> "This post is private"
                            else -> "Post may be deleted or private"
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    hasError = true
                    isLoading = false
                    errorMessage = "Post may be deleted or private"
                }
            }
        }
    }

    fun getTimeAgo(timestamp: String): String {
        return try {
            val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            format.timeZone = TimeZone.getTimeZone("UTC")
            val past = format.parse(timestamp)
            val now = Date()
            val diffInSeconds = (now.time - (past?.time ?: 0)) / 1000

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

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Post") },
                navigationIcon = {
                    IconButton(onClick = {
                        (context as? ComponentActivity)?.finish()
                    }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when {
            hasError -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .background(MaterialTheme.colorScheme.background),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Error",
                            modifier = Modifier.size(80.dp),
                            tint = MaterialTheme.colorScheme.error
                        )
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = errorMessage,
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onBackground,
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = "The post you're looking for may have been deleted or is set to private.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center
                        )
                        Spacer(Modifier.height(24.dp))
                        Button(
                            onClick = {
                                val intent = Intent(context, MainActivity::class.java)
                                context.startActivity(intent)
                                (context as? ComponentActivity)?.finish()
                            }
                        ) {
                            Icon(Icons.Default.Home, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Go to Home")
                        }
                    }
                }
            }
            isLoading -> {
                Column(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background)
                        .padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .shimmerEffect()
                        )
                        Spacer(Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .width(120.dp)
                                .height(20.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                    }
                    Spacer(Modifier.height(12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(300.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .shimmerEffect()
                    )
                    Spacer(Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .shimmerEffect()
                        )
                        Spacer(Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .width(80.dp)
                                .height(20.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .shimmerEffect()
                        )
                    }
                    Spacer(Modifier.height(8.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(60.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                    Spacer(Modifier.height(16.dp))

                    Box(
                        modifier = Modifier
                            .width(100.dp)
                            .height(24.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .shimmerEffect()
                    )
                    Spacer(Modifier.height(8.dp))

                    repeat(3) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .shimmerEffect()
                            )
                            Spacer(Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .width(100.dp)
                                        .height(16.dp)
                                        .clip(RoundedCornerShape(4.dp))
                                        .shimmerEffect()
                                )
                                Spacer(Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(14.dp)
                                        .clip(RoundedCornerShape(4.dp))
                                        .shimmerEffect()
                                )
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }
            else -> {
                post?.let { p ->
                    Column(
                        modifier = Modifier
                            .padding(padding)
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .background(MaterialTheme.colorScheme.background)
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            AvatarImage(imageUrl = p.profilePic)
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = p.username,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground,
                                modifier = Modifier.clickable {
                                    if(navController != null){
                                        navController.navigate("profile/${p.postUserId}")
                                    }
                                }
                            )

                        }
                        Spacer(Modifier.height(12.dp))
                        Image(
                            painter = rememberAsyncImagePainter(p.image),
                            contentDescription = "Post Image",
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 200.dp, max = 400.dp)
                                .clip(RoundedCornerShape(8.dp)),
                            contentScale = ContentScale.Crop
                        )

                        Spacer(Modifier.height(8.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            IconButton(onClick = {
                                scope.launch(Dispatchers.IO) {
                                    try {
                                        val request = Request.Builder()
                                            .url("$baseUrl/$postId/like")
                                            .put("{}".toRequestBody("application/json".toMediaType()))
                                            .build()
                                        val cookieClient = OkHttpClient.Builder()
                                            .cookieJar(PersistentCookieJar(context))
                                            .build()
                                        val response = cookieClient.newCall(request).execute()

                                        if (response.isSuccessful) {
                                            val json = JSONObject(response.body?.string() ?: "{}")
                                            val newLikes = json.getInt("likesCount")

                                            withContext(Dispatchers.Main) {
                                                post = p.copy(isLiked = !p.isLiked, likes = newLikes)
                                            }
                                        }
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                    }
                                }
                            }) {
                                if (p.isLiked) {
                                    Icon(Icons.Default.Favorite, contentDescription = "Liked", tint = Color.Red)
                                } else {
                                    Icon(Icons.Default.FavoriteBorder, contentDescription = "Not liked")
                                }
                            }

                            Text("${p.likes} likes", color = MaterialTheme.colorScheme.onBackground)

                            Spacer(Modifier.weight(1f))

                            IconButton(onClick = {
                                sharePostLink(context = context, postId = postId)
                            }) {
                                Icon(Icons.Default.Share, contentDescription = "Share")
                            }

                            IconButton(onClick = {
                                scope.launch(Dispatchers.IO) {
                                    try {
                                        val request = Request.Builder()
                                            .url("$baseUrl/$postId/save")
                                            .put("{}".toRequestBody("application/json".toMediaType()))
                                            .build()
                                        val cookieClient = OkHttpClient.Builder()
                                            .cookieJar(PersistentCookieJar(context))
                                            .build()
                                        val response = cookieClient.newCall(request).execute()

                                        if (response.isSuccessful) {
                                            val json = JSONObject(response.body?.string() ?: "{}")

                                            withContext(Dispatchers.Main) {
                                                post = p.copy(isSaved = !p.isSaved)
                                            }
                                        }
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                    }
                                }
                            }) {
                                if (p.isSaved) {
                                    Icon(Icons.Default.Bookmark,
                                        contentDescription = "Saved",
                                        tint = Color(0xFF7b6cc2)
                                    )
                                } else {
                                    Icon(Icons.Default.BookmarkBorder, contentDescription = "Not saved")
                                }
                            }
                        }

                        Spacer(Modifier.height(8.dp))

                        Text(
                            text = "${p.username}: ${p.title}",
                            color = MaterialTheme.colorScheme.onBackground,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(16.dp))

                        Text(
                            "Comments",
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(Modifier.height(8.dp))

                        if (comments.isEmpty()) {
                            Text(
                                "No comments yet. Be the first to comment!",
                                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                            )
                        } else {
                            comments.forEach { comment ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                ) {
                                    AvatarImage(imageUrl = comment.profilePicture, size = 32.dp)
                                    Spacer(Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = comment.userId,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                        Text(
                                            text = comment.text,
                                            color = MaterialTheme.colorScheme.onBackground,
                                            maxLines = 2,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            text = getTimeAgo(comment.createdAt),
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(Modifier.height(16.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            TextField(
                                value = commentText,
                                onValueChange = { commentText = it },
                                placeholder = { Text("Add a comment...") },
                                modifier = Modifier.weight(1f),
                                colors = TextFieldDefaults.colors(
                                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                                )
                            )
                            Spacer(Modifier.width(8.dp))
                            Button(
                                onClick = {
                                    scope.launch(Dispatchers.IO) {
                                        if (commentText.trim().isNotEmpty()) {
                                            try {
                                                val json = JSONObject().apply {
                                                    put("text", commentText.trim())
                                                }
                                                val body = JSONObject().put("text", commentText).toString()
                                                    .toRequestBody("application/json".toMediaType())
                                                val request = Request.Builder()
                                                    .url("$baseUrl/$postId/comment")
                                                    .post(body)
                                                    .build()
                                                val cookieClient = OkHttpClient.Builder()
                                                    .cookieJar(PersistentCookieJar(context))
                                                    .build()
                                                val response = cookieClient.newCall(request).execute()

                                                if (response.code == 201) {
                                                    Log.d("Profile Picture",prefs.getString("profilePicture","").toString())
                                                    val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                                                    val newComment = CommentsOfPost(
                                                        id = System.currentTimeMillis().toString(),
                                                        text = commentText,
                                                        createdAt = sdf.format(Date()).toString(),
                                                        userId = prefs.getString("userId","").toString(),
                                                        profilePicture = prefs.getString("profilePicture","").toString()
                                                    )

                                                    withContext(Dispatchers.Main) {
                                                        comments = comments + newComment
                                                        commentText = ""
                                                    }
                                                }
                                            } catch (e: Exception) {
                                                e.printStackTrace()
                                            }
                                        }
                                    }
                                },
                                enabled = commentText.trim().isNotEmpty()
                            ) {
                                Text("Post")
                            }
                        }
                    }
                }
            }
        }
    }
}


fun sharePostLink(context: Context, postId: String) {
    val postUrl = "https://gram-snap.vercel.app/post/$postId"

    val sendIntent = Intent().apply {
        action = Intent.ACTION_SEND
        putExtra(Intent.EXTRA_TEXT, "Check this post: $postUrl")
        type = "text/plain"
    }

    val shareIntent = Intent.createChooser(sendIntent, "Share post via")
    context.startActivity(shareIntent)
}
@Composable
fun AvatarImage(imageUrl: String?, size: Dp = 40.dp) {
    if (imageUrl.isNullOrBlank()) {
        Icon(
            imageVector = Icons.Default.AccountCircle,
            contentDescription = "Avatar",
            modifier = Modifier.size(size),
            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
        )
    } else {
        val imgBitmap = remember(imageUrl) {
            decodeBase64ToBitmap(imageUrl)
        }
        if(imgBitmap != null){
            Image(
                bitmap = imgBitmap.asImageBitmap(),
                contentDescription = "Avatar",
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        }
    }
}