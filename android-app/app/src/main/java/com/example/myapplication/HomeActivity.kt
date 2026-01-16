package com.example.myapplication

import android.Manifest
import android.app.Activity
import android.content.Context
import android.net.Uri
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
import android.util.Log
import androidx.compose.ui.res.painterResource
import androidx.activity.ComponentActivity
import androidx.compose.ui.graphics.asImageBitmap
import androidx.activity.compose.setContent
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.composed
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.core.content.ContextCompat
import coil.compose.rememberAsyncImagePainter
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.filled.Edit
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.canhub.cropper.CropImageContract
import com.canhub.cropper.CropImageContractOptions
import com.canhub.cropper.CropImageOptions
import com.canhub.cropper.CropImageView
import kotlinx.coroutines.CoroutineScope
import java.io.File
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.FileOutputStream
import java.io.InputStream
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

data class Story(
    val storyId: String,
    val userId: String,
    val userName: String,
    val userProfilePic: String,
    val storyImage: String,
    val isViewed: Boolean,
    val createdAt: String,
    val viewers: List<Viewer> = emptyList()
)

data class Viewer(
    val userId: String,
    val userName: String,
    val userProfilePic: String
)

data class Post(
    val postId: String,
    val userId: String,
    val name: String,
    val profilePictureBitmap: Bitmap?,
    val postPicBitmap: Bitmap?,
    val caption: String,
    val likes: Int,
    val isLiked: Boolean,
    val isSaved: Boolean
)


data class Comment(
    val commentId: String,
    val userId: UserInfo,
    val text: String,
    val createdAt: String
)

data class UserInfo(
    val userId: String,
    val name: String,
    val profilePicture: String
)

class HomeActivity : ComponentActivity() {
    public var shimmerColors = listOf(
        Color(0xFF2C2C2C),
        Color(0xFF3A3A3A),
        Color(0xFF2C2C2C)
    )
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                MyAppNavHost()
            }
        }
    }


    fun navigateTo(target: Class<out Activity>) {
        runOnUiThread {
            val intent = Intent(this, target)
            startActivity(intent)
            finish() // prevent returning to MainActivity
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
        shimmerColors = if (darkTheme) {
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

        MaterialTheme(
            colorScheme = colors,
            content = content
        )
    }

    @Composable
    fun MyAppNavHost() {
        val navController = rememberNavController()
        val selectedTab = rememberSaveable { mutableStateOf("home") }

        val context = LocalContext.current
        NavHost(
            navController = navController,
            startDestination = "home"
        ) {
            composable("home") {
                HomeScreen(navController)
            }
            composable("post/{postId}") { backStackEntry ->
                val postId = backStackEntry.arguments?.getString("postId").toString()
                PostScreen(postId)
            }
            composable("add"){
                AddPostScreen(navController)
            }
            composable("add_story") {
                AddYourStoryFlow(onDismiss = {
                    navController.popBackStack()
                })
            }

            composable("search"){
                SearchScreen(navController)
            }
            composable("settings") {
                SettingsActivity(
                    navController = navController,
                    onBack = { navController.popBackStack() }
                )
            }
            composable("profile/{userId}") { backStackEntry ->
                val userId = backStackEntry.arguments?.getString("userId") ?: ""
                CommonProfileScreen(userId = userId, onBack = { navController.popBackStack() }, navController)
            }
            composable("profile") { backStackEntry ->

                val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
                val userId = prefs.getString("userId","").toString()
                UserProfileScreen(userId = userId, onBack = { navController.popBackStack() }, navController)
            }
            composable("messages") {
                MessageListScreen(
                    context = context,
                    onUserClick = { user ->

                        val encodedProfile = URLEncoder.encode(user.profilePicture, StandardCharsets.UTF_8.toString())
                        navController.navigate("message/${user.userId}/${user.username}/${encodedProfile}/${user.online}/${user.lastSeen}")
                    }
                )
            }
            composable("message/{userId}/{username}/{profilePicture}/{online}/{lastSeen}") { backStackEntry ->
                val userId = backStackEntry.arguments?.getString("userId") ?: ""
                val username = backStackEntry.arguments?.getString("username") ?: ""
                val profilePicture = backStackEntry.arguments?.getString("profilePicture")
                val online = backStackEntry.arguments?.getString("online")?.toBoolean() ?: false
                val lastSeen = backStackEntry.arguments?.getString("lastSeen")

                MessageScreen(
                    context = context,
                    receiverUserId = userId,
                    receiverUsername = username,
                    receiverProfilePicture = profilePicture,
                    receiverOnline = online,
                    receiverLastSeen = lastSeen,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }


    @OptIn(ExperimentalMaterial3Api::class)
    @Preview
    @Composable
    fun HomeScreen(navController: NavController) {

        val scope = rememberCoroutineScope()
        val snackbarHostState = remember { SnackbarHostState() }

        var stories by remember { mutableStateOf<List<Story>>(emptyList()) }
        var posts by remember { mutableStateOf<List<Post>>(emptyList()) }

        var storiesLoading by remember { mutableStateOf(true) }
        var postsLoading by remember { mutableStateOf(true) }

        var selectedStory by remember { mutableStateOf<Story?>(null) }
        var showStoryDialog by remember { mutableStateOf(false) }
        var selectedMenuItem by remember { mutableStateOf("Home") }

        var commentsMap by remember { mutableStateOf<Map<String, List<Comment>>>(emptyMap()) }
        var showCommentsMap by remember { mutableStateOf<Map<String, Boolean>>(emptyMap()) }
        var commentTextMap by remember { mutableStateOf<Map<String, String>>(emptyMap()) }

        fun showSnack(msg: String) {
            scope.launch {
                snackbarHostState.showSnackbar(msg)
            }
        }

        fun fetchStories(context: Context) {
            scope.launch(Dispatchers.IO) {
                try {
                    val client = OkHttpClient.Builder()
                        .cookieJar(PersistentCookieJar(context))
                        .build()
                    val request = Request.Builder()
                        .url("https://backend-eror.onrender.com/story/get")
                        .get()
                        .build()

                    val response = client.newCall(request).execute()
                    if (response.isSuccessful) {
                        val jsonArray = JSONArray(response.body?.string() ?: "[]")
                        val storyList = mutableListOf<Story>()
                        for (i in 0 until jsonArray.length()) {
                            val obj = jsonArray.getJSONObject(i)
                            storyList.add(
                                Story(
                                    storyId = obj.getString("storyId"),
                                    userId = obj.getString("userId"),
                                    userName = obj.getString("userName"),
                                    userProfilePic = obj.getString("userProfilePic"),
                                    storyImage = obj.getString("storyImage"),
                                    isViewed = obj.getBoolean("isViewed"),
                                    createdAt = obj.getString("createdAt")
                                )
                            )
                        }
                        withContext(Dispatchers.Main) {
                            stories = storyList
                            storiesLoading = false
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        storiesLoading = false
                    }
                }
            }
        }

        fun fetchPosts(context: Context) {
            scope.launch(Dispatchers.IO) {
                try {
                    val client = OkHttpClient.Builder()
                        .cookieJar(PersistentCookieJar(context))
                        .build()

                    val request = Request.Builder()
                        .url("https://backend-eror.onrender.com/home")
                        .get()
                        .build()

                    val response = client.newCall(request).execute()
                    if (response.isSuccessful) {
                        val bodyString = response.body?.string() ?: "{}"
                        val json = JSONObject(bodyString)

                        Log.d("FetchPosts", "✅ Response received successfully.")

                        val jsonArray = json.getJSONArray("homePosts")
                        val postList = mutableListOf<Post>()

                        for (i in 0 until jsonArray.length()) {
                            val obj = jsonArray.getJSONObject(i)

                            // Decode Base64 images safely
                            val profileBase64 = obj.optString("profilePicture", "")
                            val postPicBase64 = obj.optString("postPic", "")

                            val profileBitmap = decodeBase64ToBitmap(profileBase64)
                            val postBitmap = decodeBase64ToBitmap(postPicBase64)

                            postList.add(
                                Post(
                                    postId = obj.getString("postId"),
                                    userId = obj.getString("userId"),
                                    name = obj.getString("name"),
                                    profilePictureBitmap = profileBitmap,
                                    postPicBitmap = postBitmap,
                                    caption = obj.getString("caption"),
                                    likes = obj.getInt("likes"),
                                    isLiked = obj.getBoolean("isLiked"),
                                    isSaved = obj.getBoolean("isSaved")
                                )
                            )
                        }

                        // 🔒 Remove duplicates based on postId
                        val uniquePosts = postList.distinctBy { it.postId }

                        Log.d("FetchPosts", "📦 Total posts fetched: ${uniquePosts.size}")

                        withContext(Dispatchers.Main) {
                            posts = uniquePosts
                            postsLoading = false
                        }
                    } else {
                        Log.e("FetchPosts", "❌ Failed: ${response.code}")
                        withContext(Dispatchers.Main) { postsLoading = false }
                    }
                } catch (e: Exception) {
                    Log.e("FetchPosts", "⚠️ Error: ${e.message}", e)
                    withContext(Dispatchers.Main) {
                        postsLoading = false
                    }
                }
            }
        }


        fun likePost(postId: String, context: Context) {
            scope.launch(Dispatchers.IO) {
                try {
                    val client = OkHttpClient.Builder()
                        .cookieJar(PersistentCookieJar(context))
                        .build()
                    val request = Request.Builder()
                        .url("https://backend-eror.onrender.com/$postId/like")
                        .put("{}".toRequestBody("application/json".toMediaType()))
                        .build()

                    val response = client.newCall(request).execute()
                    if (response.isSuccessful) {
                        val json = JSONObject(response.body?.string() ?: "{}")
                        val likesCount = json.getInt("likesCount")
                        withContext(Dispatchers.Main) {
                            posts = posts.map { post ->
                                if (post.postId == postId) {
                                    post.copy(isLiked = !post.isLiked, likes = likesCount)
                                } else post
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Handle error
                }
            }
        }

        fun savePost(postId: String, context: Context) {
            scope.launch(Dispatchers.IO) {
                try {
                    val client = OkHttpClient.Builder()
                        .cookieJar(PersistentCookieJar(context))
                        .build()
                    val request = Request.Builder()
                        .url("https://backend-eror.onrender.com/$postId/save")
                        .put("{}".toRequestBody("application/json".toMediaType()))
                        .build()

                    val response = client.newCall(request).execute()
                    if (response.isSuccessful) {
                        withContext(Dispatchers.Main) {
                            posts = posts.map { post ->
                                if (post.postId == postId) {
                                    post.copy(isSaved = !post.isSaved)
                                } else post
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Handle error
                }
            }
        }

        fun toggleComments(postId: String, context: Context) {
            if (commentsMap[postId] == null) {
                scope.launch(Dispatchers.IO) {
                    try {
                        val client = OkHttpClient.Builder()
                            .cookieJar(PersistentCookieJar(context))
                            .build()
                        val request = Request.Builder()
                            .url("https://backend-eror.onrender.com/post/$postId/comment")
                            .get()
                            .build()

                        val response = client.newCall(request).execute()
                        if (response.isSuccessful) {
                            val json = JSONObject(response.body?.string() ?: "{}")
                            val jsonArray = json.getJSONArray("comments")
                            val commentList = mutableListOf<Comment>()
                            for (i in 0 until jsonArray.length()) {
                                val obj = jsonArray.getJSONObject(i)
                                val userObj = obj.getJSONObject("userId")
                                commentList.add(
                                    Comment(
                                        commentId = obj.getString("_id"),
                                        userId = UserInfo(
                                            userId = userObj.getString("userId"),
                                            name = userObj.getString("name"),
                                            profilePicture = userObj.getString("profilePicture")
                                        ),
                                        text = obj.getString("text"),
                                        createdAt = obj.getString("createdAt")
                                    )
                                )
                            }
                            withContext(Dispatchers.Main) {
                                commentsMap = commentsMap + (postId to commentList)
                            }
                        }
                    } catch (e: Exception) {
                        // Handle error
                    }
                }
            }
            showCommentsMap = showCommentsMap + (postId to !(showCommentsMap[postId] ?: false))
        }

        fun postComment(postId: String, context: Context) {
            val text = commentTextMap[postId] ?: ""
            if (text.trim().isEmpty()) return

            scope.launch(Dispatchers.IO) {
                try {
                    val client = OkHttpClient.Builder()
                        .cookieJar(PersistentCookieJar(context))
                        .build()
                    val body = JSONObject().put("text", text).toString()
                        .toRequestBody("application/json".toMediaType())
                    val request = Request.Builder()
                        .url("https://backend-eror.onrender.com/$postId/comment")
                        .post(body)
                        .build()

                    val response = client.newCall(request).execute()
                    if (response.code == 201) {
                        withContext(Dispatchers.Main) {
                            commentTextMap = commentTextMap + (postId to "")
                            toggleComments(postId, context)
                            showSnack("Comment posted")
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        showSnack("Error posting comment")
                    }
                }
            }
        }

        val context = LocalContext.current
        LaunchedEffect(Unit) {
            fetchStories(context)
            fetchPosts(context)
        }

        val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        val profilePicture = prefs.getString("profilePicture","").toString()
        val profilePictureBitmap = remember {
            com.example.myapplication.decodeBase64ToBitmap(
                profilePicture
            )
        }
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
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

        ) { padding ->
            Column(modifier = Modifier.fillMaxSize()) {

                // Static Image and Bell Icon Section (Above Stories)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                ) {
                    // Left-side Image
                    Image(
                        painter = painterResource(id = R.drawable.top_logo), // Your image resource
                        contentDescription = "Left Image",
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(start = 16.dp)
                            .size(30.dp)
                    )

                    // Right-side Bell Icon
                    IconButton(
                        onClick = {
                            navigateTo(NotificationActivity::class.java)
                        },
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Notifications,
                            contentDescription = "Notifications"
                        )
                    }
                }

                // LazyColumn for content (Posts, etc.)
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                ) {
                    // Stories Section
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(210.dp)
                                .padding(vertical = 8.dp)
                        ) {
                            if (storiesLoading) {
                                StoriesLoadingSkeleton()
                            } else {
                                var showAddStory by remember { mutableStateOf(false) }
                                LazyRow(
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    contentPadding = PaddingValues(horizontal = 16.dp)
                                ) {
                                    // Add Yours card as the first item

                                    item {
                                        AddYourStoryCard(
                                            onClick = {
                                                Log.d("DEBUG", "AddYourStoryCard clicked")
                                                Toast.makeText(context,"Story Clicked",Toast.LENGTH_SHORT).show()
                                                showAddStory = true
                                                navController.navigate("add_story")
                                            }
                                        )

//
                                        if (showAddStory) {
                                            AddYourStoryFlow(onDismiss = { showAddStory = false })
                                        }
                                    }

                                    // Other stories
                                    items(stories) { story ->
                                        StoryCard(
                                            story = story,
                                            onClick = {
                                                selectedStory = story
                                                showStoryDialog = true
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }


                    // Posts Section
                    if (postsLoading) {
                        items(3) {
                            PostLoadingSkeleton()
                        }
                    } else {
                        items(posts) { post ->
                            PostCard(
                                post = post,
                                comments = commentsMap[post.postId] ?: emptyList(),
                                showComments = showCommentsMap[post.postId] ?: false,
                                commentText = commentTextMap[post.postId] ?: "",
                                onLike = { likePost(post.postId, context) },
                                onSave = { savePost(post.postId, context) },
                                onToggleComments = { toggleComments(post.postId, context) },
                                onCommentTextChange = { text ->
                                    commentTextMap = commentTextMap + (post.postId to text)
                                },
                                onShare = { postId ->
                                    sharePostLink(context = context, postId = postId)
                                },
                                onPostComment = { postComment(post.postId, context) },
                                navController = navController
                            )
                        }
                    }
                }
            }
        }


        if (showStoryDialog && selectedStory != null) {
            StoryDialog(
                story = selectedStory!!,
                onDismiss = {
                    showStoryDialog = false
                    selectedStory = null
                }
            )
        }
    }

    @Composable
    fun StoriesLoadingSkeleton() {
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 16.dp)
        ) {
            items(5) { index ->
                Box(
                    modifier = Modifier
                        .width(160.dp)
                        .height(190.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            Brush.linearGradient(
                                colors = shimmerColors
                            )
                        )
                        .let { baseModifier ->
                            // 👇 Blur only the first item
                            if (index == 0) baseModifier.blur(12.dp)
                            else baseModifier
                        }
                        .shimmerEffect()
                )
            }
        }
    }


    @Composable
    fun PostLoadingSkeleton() {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE0E0E0))
                        .shimmerEffect()
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .width(120.dp)
                        .height(16.dp)
                        .background(Color(0xFFE0E0E0))
                        .shimmerEffect()
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFE0E0E0))
                    .shimmerEffect()
            )

            Spacer(modifier = Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(16.dp)
                    .background(Color(0xFFE0E0E0))
                    .shimmerEffect()
            )
        }
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

        this.background(
            Brush.linearGradient(
                colors = listOf(
                    Color(0xFFE0E0E0),
                    Color(0xFFF5F5F5),
                    Color(0xFFE0E0E0)
                ),
                start = androidx.compose.ui.geometry.Offset(offsetX, 0f),
                end = androidx.compose.ui.geometry.Offset(offsetX + 500f, 500f)
            )
        )
    }


    @Composable
    fun AddYourStoryCard(onClick: () -> Unit) {
        Column(
            modifier = Modifier
                .width(100.dp)
                .height(180.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .clickable { onClick() }
                .padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Edit,
                contentDescription = "Add Yours",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Add yours",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }

    @Composable
    fun AddYourStoryFlow(onDismiss: () -> Unit) {
        val context = LocalContext.current
        val imageUri = remember { mutableStateOf<Uri?>(null) }
        val tempImageUri = remember { mutableStateOf<Uri?>(null) }
        var isUploading by remember { mutableStateOf(false) }


        // ───── Crop Image Result ─────
        val cropImageLauncher = rememberLauncherForActivityResult(CropImageContract()) { result ->
            if (result.isSuccessful) {
                val croppedUri = result.uriContent
                croppedUri?.let {
                    imageUri.value = it
                    Toast.makeText(context, "Image Cropped!", Toast.LENGTH_SHORT).show()
                    // Upload logic can go here
                    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
                    val userId = prefs.getString("userId","").toString()
                    isUploading = true
                    CoroutineScope(Dispatchers.IO).launch {
                        val success = uploadStory(context, it, userId)
                        withContext(Dispatchers.Main) {
                            isUploading = false
                            if (success) {
                                Toast.makeText(context, "Story uploaded successfully!", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "Failed to upload story", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
            } else {
                Toast.makeText(context, "Cropping failed!", Toast.LENGTH_SHORT).show()
            }
        }

        // ───── Image Picker from Gallery ─────
        val pickImageLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.GetContent()
        ) { uri: Uri? ->
            uri?.let {
                launchCropper(cropImageLauncher, it)
            }
        }

        // ───── Camera Capture ─────
        // Camera launcher
        val takePictureLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.TakePicture()
        ) { success ->
            if (success) {
                tempImageUri.value?.let { uri ->
                    launchCropper(cropImageLauncher, uri)
                }
            } else {
                Toast.makeText(context, "Camera capture failed!", Toast.LENGTH_SHORT).show()
            }
        }
        // Permission launcher
        val cameraPermissionLauncher = rememberLauncherForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) {
                // Permission granted, launch camera
                captureImageFromCamera(context, takePictureLauncher, tempImageUri)
            } else {
                Toast.makeText(context, "Camera permission denied", Toast.LENGTH_SHORT).show()
            }
        }

        fun onCameraSelected() {
            // Check if permission already granted
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                captureImageFromCamera(context, takePictureLauncher, tempImageUri)
            } else {
                // Request permission
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }



        // ───── Dialog State ─────
        var showDialog by remember { mutableStateOf(false) }

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Add Story") },
                text = { Text("Choose an image source") },
                confirmButton = {
                    TextButton(onClick = {
                        showDialog = false
                        pickImageLauncher.launch("image/*")
                    }) { Text("Gallery") }
                },
                dismissButton = {
                    TextButton(onClick = {
                        showDialog = false
                        onCameraSelected()
                    }) { Text("Camera") }
                }
            )
        }

        // ───── The Card UI ─────
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .clickable { showDialog = true }
                .padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Edit,
                contentDescription = "Add Story",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Add yours",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }

        if (isUploading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.4f)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary,
                        strokeWidth = 4.dp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Uploading...",
                        color = Color.White,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }


//        // ───── Optional: Show Cropped Image Preview ─────
//        imageUri.value?.let { uri ->
//            Spacer(modifier = Modifier.height(16.dp))
//            Text("Cropped Image:")
//            Image(
//                painter = rememberAsyncImagePainter(uri),
//                contentDescription = "Cropped Image Preview",
//                modifier = Modifier
//                    .size(150.dp)
//                    .clip(RoundedCornerShape(8.dp))
//            )
//        }
    }

// ───── Helper Functions ─────

    fun launchCropper(
        launcher: androidx.activity.result.ActivityResultLauncher<CropImageContractOptions>,
        uri: Uri
    ) {
        val options = CropImageOptions().apply {
            cropShape = CropImageView.CropShape.RECTANGLE
            guidelines = CropImageView.Guidelines.ON
            fixAspectRatio = false
        }
        val contractOptions = CropImageContractOptions(uri, options)
        launcher.launch(contractOptions)
    }

    fun captureImageFromCamera(
        context: Context,
        launcher: androidx.activity.result.ActivityResultLauncher<Uri>,
        tempImageUri: MutableState<Uri?>
    ) {
        val photoFile = File(context.cacheDir, "temp_image_${System.currentTimeMillis()}.jpg")
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            photoFile
        )
        tempImageUri.value = uri
        launcher.launch(uri)
    }

    @Composable
    fun StoryCard(story: Story, onClick: () -> Unit) {
        Column(
            modifier = Modifier
                .width(160.dp)
                .height(190.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surface)
                .clickable(onClick = onClick)
                .padding(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .clip(RoundedCornerShape(12.dp))
            ) {
                val storyBitmap = remember(story.storyImage) {
                    decodeBase64ToBitmap(story.storyImage)
                }
                if (storyBitmap != null) {
                    Image(
                        bitmap = storyBitmap.asImageBitmap(),
                        contentDescription = "Story",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxSize()
                            .blur(5.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .border(
                            width = 2.dp,
                            color = if (story.isViewed) Color.Gray else Color(0xFF7b6cc2),
                            shape = CircleShape
                        )
                        .padding(2.dp)
                ) {
                    val profileBitmap = remember(story.userProfilePic) {
                        decodeBase64ToBitmap(story.userProfilePic)
                    }
                    if (profileBitmap != null) {
                        Image(
                            bitmap = profileBitmap.asImageBitmap(),
                            contentDescription = "Profile",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape)
                        )
                    }
                }

                Text(
                    text = story.userName,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1
                )
            }
        }
    }

    @Composable
    fun PostCard(
        post: Post,
        comments: List<Comment>,
        showComments: Boolean,
        commentText: String,
        onLike: () -> Unit,
        onSave: () -> Unit,
        onToggleComments: () -> Unit,
        onCommentTextChange: (String) -> Unit,
        onPostComment: () -> Unit,
        onShare: (postId: String) -> Unit,
        navController: NavController
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp, horizontal = 16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        )    {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                // User Info
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    if (post.profilePictureBitmap != null) {
                        Image(
                            bitmap = post.profilePictureBitmap.asImageBitmap(),
                            contentDescription = null,
                            modifier = Modifier.size(40.dp).clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = post.userId,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            modifier = Modifier.clickable {
                                if(navController != null){
                                    navController.navigate("profile/${post.userId}")
                                }
                            }
                        )
                        Text(
                            text = post.name,
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }

                // Post Image
                if (post.postPicBitmap != null) {
                    Image(
                        bitmap = post.postPicBitmap.asImageBitmap(),
                        contentDescription = "Post",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(8.dp))
                    )
                }

                // Actions
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row {
                        IconButton(onClick = onLike) {
                            Icon(
                                imageVector = if (post.isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Like",
                                tint = if (post.isLiked) Color.Red else Color.Gray
                            )
                        }
                        Text(
                            text = post.likes.toString(),
                            modifier = Modifier.align(Alignment.CenterVertically)
                        )
                        Spacer(modifier = Modifier.width(10.dp))

                        IconButton(onClick = { onShare(post.postId) }) { // <-- Share Action
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = "Share",
                                tint = Color.Gray
                            )
                        }
                    }

                    IconButton(onClick = onSave) {
                        Icon(
                            imageVector = if (post.isSaved) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                            contentDescription = "Save",
                            tint = if (post.isSaved) Color(0xFF7b6cc2) else Color.Gray
                        )
                    }
                }

                // Caption
                Text(
                    text = "${post.name} ${post.caption}",
                    fontSize = 14.sp,
                    modifier = Modifier.padding(vertical = 4.dp)
                )

                // Comments Toggle
                Text(
                    text = if (showComments) "Hide Comments" else "Show Comments",
                    color = Color(0xFF0077cc),
                    fontSize = 12.sp,
                    modifier = Modifier
                        .clickable(onClick = onToggleComments)
                        .padding(vertical = 4.dp)
                )

                // Add Comment
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = commentText,
                        onValueChange = onCommentTextChange,
                        placeholder = { Text("Add a comment...") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = onPostComment,
                        enabled = commentText.trim().isNotEmpty()
                    ) {
                        Text("Post")
                    }
                }
                // Comments List
                if (showComments) {
                    comments.forEach { comment ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            val profileBitmap = remember(comment.userId.profilePicture) {
                                decodeBase64ToBitmap(comment.userId.profilePicture)
                            }
                            if (profileBitmap != null) {
                                Image(
                                    bitmap = profileBitmap.asImageBitmap(),
                                    contentDescription = "Commenter",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = comment.userId.userId,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = comment.text,
                                    fontSize = 12.sp
                                )
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


    @Composable
    fun StoryDialog(story: Story, onDismiss: () -> Unit) {
        Dialog(onDismissRequest = onDismiss) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val profileBitmap = remember(story.userProfilePic) {
                                decodeBase64ToBitmap(story.userProfilePic)
                            }

                            if (profileBitmap != null) {
                                Image(
                                    bitmap = profileBitmap.asImageBitmap(),
                                    contentDescription = "Profile Picture",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                )
                            } else {
                                // Optional: Placeholder avatar
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(Color.LightGray)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = story.userName,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 16.sp,
                                    color = Color.Black
                                )

                                Text(
                                    text = getTimeAgo(story.createdAt),
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                            }
                        }
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Filled.Close, contentDescription = "Close")
                        }

                    }


                    Spacer(modifier = Modifier.height(16.dp))
                    val storyBitmap = remember(story.storyImage) {
                        decodeBase64ToBitmap(story.storyImage)
                    }
                    if (storyBitmap != null) {
                        Image(
                            bitmap = storyBitmap.asImageBitmap(),
                            contentDescription = "Story",
                            contentScale = ContentScale.Fit,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(400.dp)
                                .clip(RoundedCornerShape(12.dp))
                        )
                    }
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
    suspend fun uploadStory(
        context: Context,
        imageUri: Uri,
        userId: String
    ): Boolean {
        return try {
            // Copy image from URI to a temp file
            val inputStream: InputStream? = context.contentResolver.openInputStream(imageUri)
            val tempFile = File(context.cacheDir, "story_upload_${System.currentTimeMillis()}.jpg")
            val outputStream = FileOutputStream(tempFile)
            inputStream?.copyTo(outputStream)
            inputStream?.close()
            outputStream.close()

            // Build multipart form data
            val requestBody = MultipartBody.Builder().setType(MultipartBody.FORM)
                .addFormDataPart("userId", userId)
                .addFormDataPart(
                    "image",
                    tempFile.name,
                    tempFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
                )
                .build()

            // Create OkHttp client and request
            val client = OkHttpClient.Builder()
                .cookieJar(PersistentCookieJar(context))
                .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .build()
            val request = Request.Builder()
                .url("https://backend-eror.onrender.com/story/create")
                .post(requestBody)
                .build()

            // Execute request
            val response = client.newCall(request).execute()

            val success = response.isSuccessful
            Log.d("UploadStory", "Response: ${response.code} - ${response.message}")
            response.close()

            success
        } catch (e: Exception) {
            Log.e("UploadStory", "Upload failed: ${e.message}", e)
            false
        }
    }
}
