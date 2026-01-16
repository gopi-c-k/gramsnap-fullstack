package com.example.myapplication

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.io.IOException

// OkHttpClient singleton
object APISClient {
    private const val BASE_URL = "https://backend-eror.onrender.com"
    private var client: OkHttpClient? = null
    private val gson = Gson()

    fun initialize(context: Context) {
        if (client == null) {
            client = OkHttpClient.Builder()
                .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .cookieJar(PersistentCookieJar(context))
                .build()
        }
    }

    private fun getClient(): OkHttpClient {
        return client ?: throw IllegalStateException("ApiClient not initialized. Call initialize() first.")
    }
    suspend fun getFollowers(userId: String) : List<UserItem>{
        return  withContext(Dispatchers.IO){
            val url = HttpUrl.Builder()
                .scheme("https")
                .host("backend-eror.onrender.com") // replace with your actual domain
                .addPathSegment("user")
                .addPathSegment("followers")
                .addQueryParameter("userId", userId)
                .build()
            val request = Request.Builder()
                .url(url)
                .get()
                .build()

            val response = getClient().newCall(request).execute()

            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: throw IOException("Empty response body")
            gson.fromJson(responseBody, Array<UserItem>::class.java).toList()
        }
    }

    suspend fun getFollowing(userId: String) : List<UserItem>{
        return  withContext(Dispatchers.IO){
            val url = HttpUrl.Builder()
                .scheme("https")
                .host("backend-eror.onrender.com") // replace with your actual domain
                .addPathSegment("user")
                .addPathSegment("following")
                .addQueryParameter("userId", userId)
                .build()
            val request = Request.Builder()
                .url(url)
                .get()
                .build()

            val response = getClient().newCall(request).execute()

            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: throw IOException("Empty response body")
            gson.fromJson(responseBody, Array<UserItem>::class.java).toList()
        }
    }
    suspend fun getUserProfile(userId: String): UserProfileResponse {
        return withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$BASE_URL/profile/$userId")
                .get()
                .build()

            val response = getClient().newCall(request).execute()
            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: throw IOException("Empty response body")
            gson.fromJson(responseBody, UserProfileResponse::class.java)
        }
    }
    suspend fun getSavedPost(): List<PostItem> {
        return withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$BASE_URL/user/saved")
                .get()
                .build()

            val response = getClient().newCall(request).execute()
            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: throw IOException("Empty response body")
            Log.d("Saved Post", responseBody)

            // Parse the wrapper object first
            val jsonObject = JSONObject(responseBody)
            val postsJson = jsonObject.getJSONArray("posts")

            val posts = mutableListOf<PostItem>()
            for (i in 0 until postsJson.length()) {
                val postItem = gson.fromJson(postsJson.getJSONObject(i).toString(), PostItem::class.java)
                posts.add(postItem)
            }

            posts
        }
    }

    suspend fun updateProfile(
        name: String,
        bio: String,
        isPrivate: Boolean,
        newUserId: String?,
        profilePicture: File?
    ): UpdateProfileResponse = withContext(Dispatchers.IO) {
        try {
            val requestBodyBuilder = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("name", name)
                .addFormDataPart("bio", bio)
                .addFormDataPart("isPrivate", isPrivate.toString())

            newUserId?.let {
                requestBodyBuilder.addFormDataPart("newUserId", it)
            }

            profilePicture?.let { file ->
                val body = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                requestBodyBuilder.addFormDataPart("profilePicture", file.name, body)
            }

            val request = Request.Builder()
                .url("${BASE_URL}/update")
                .put(requestBodyBuilder.build())
                .build()

            val response = getClient().newCall(request).execute()
            val responseBody = response.body?.string() ?: throw Exception("Empty response")

            if (!response.isSuccessful) {
                val errorMessage = try {
                    JSONObject(responseBody).optString("error", "Failed to update profile")
                } catch (e: Exception) {
                    "Failed to update profile"
                }
                throw Exception(errorMessage)
            }

            val json = JSONObject(responseBody)
            UpdateProfileResponse(
                userId = json.optString("userIds", ""),
                name = json.optString("names", ""),
                bio = json.optString("bio", ""),
                profilePicture = json.optString("profilePicture", ""),
                isPrivate = json.optBoolean("isPrivate", false)
            )
        } catch (e: Exception) {
            throw Exception(e.message ?: "Network error")
        }
    }


    suspend fun followUser(userId: String): FollowResponse {
        return withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$BASE_URL/follow/$userId")
                .post("".toRequestBody("application/json".toMediaType()))
                .build()

            val response = getClient().newCall(request).execute()
            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: throw IOException("Empty response body")
            gson.fromJson(responseBody, FollowResponse::class.java)
        }
    }

    suspend fun unfollowUser(userId: String): FollowResponse {
        return withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$BASE_URL/unfollow/$userId")
                .post("".toRequestBody("application/json".toMediaType()))
                .build()

            val response = getClient().newCall(request).execute()
            if (!response.isSuccessful) {
                throw IOException("Unexpected code $response")
            }

            val responseBody = response.body?.string() ?: throw IOException("Empty response body")
            gson.fromJson(responseBody, FollowResponse::class.java)
        }
    }
    suspend fun sendMessageHi(senderId: String, receiverId: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val json = """
                {
                    "senderId": "$senderId",
                    "receiverId": "$receiverId",
                    "message": "Hi"
                }
            """.trimIndent()

                val requestBody = json.toRequestBody("application/json".toMediaType())
                val request = Request.Builder()
                    .url("${APISClient.BASE_URL}/chat/send")
                    .post(requestBody)
                    .build()

                val response = APISClient.getClient().newCall(request).execute()

                if (response.isSuccessful && response.code == 201) {
                    true // Message sent successfully
                } else {
                    false
                }
            } catch (e: Exception) {
                Log.e("SendMessage", "Error occurred: ${e.message}")
                false
            }
        }
    }

}

// Data Classes with Gson annotations
data class UserProfileResponse(
    @SerializedName("userId") val userId: String,
    @SerializedName("username") val username: String,
    @SerializedName("name") val name: String,
    @SerializedName("profilePicture") val profilePicture: String,
    @SerializedName("bio") val bio: String? = "",
    @SerializedName("postSize") val postsCount: Int = 0,
    @SerializedName("followersSize") val followersCount: Int = 0,
    @SerializedName("followingSize") val followingCount: Int = 0,
    @SerializedName("posts") val posts: List<PostItem> = emptyList(),
    @SerializedName("following") val following: List<UserItem> = emptyList(),
    @SerializedName("isFollow") val isFollowing: Boolean = false,
    @SerializedName("isRequestSent") val isRequestSent: Boolean = false
)

data class PostItem(
    @SerializedName("postId") val id: String,
    @SerializedName("image") val image: String,
)

data class UserItem(
    @SerializedName("userId") val userId: String,
    @SerializedName("name") val name: String,
    @SerializedName("profilePicture") val profilePicture: String
)
data class FollowResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String
)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommonProfileScreen(
    userId: String,
    onBack: () -> Unit,
    navController: NavController
) {
    val context = LocalContext.current
    var userProfile by remember { mutableStateOf<UserProfileResponse?>(null) }
    val followers = remember { mutableStateListOf<UserItem>() }
    val following = remember { mutableStateListOf<UserItem>() }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var isFollowing by remember { mutableStateOf(false) }
    var isRequestSent by  remember { mutableStateOf(false) }
    var selectedTab by remember { mutableStateOf(0) }
    var followLoading by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    // Initialize ApiClient
    LaunchedEffect(Unit) {
        APISClient.initialize(context)
    }

    // Fetch user profile
    LaunchedEffect(userId) {
        try {
            loading = true
            error = null
            val response = APISClient.getUserProfile(userId)
            userProfile = response
            val fetchedFollowers = APISClient.getFollowers(userId)
            followers.clear()
            followers.addAll(fetchedFollowers)
            val fetchedFollowing = APISClient.getFollowing(userId)
            following.clear()
            following.addAll(fetchedFollowing)
            isFollowing = response.isFollowing
            isRequestSent = response.isRequestSent
            loading = false
        } catch (e: Exception) {
            error = e.message ?: "Failed to load profile"
            loading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(userProfile?.username ?: userId) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize()) {
            when {
                loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                error != null -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error: $error",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = {
                            scope.launch {
                                try {
                                    loading = true
                                    error = null
                                    val response = APISClient.getUserProfile(userId)
                                    userProfile = response
                                    val fetchedFollowers = APISClient.getFollowers(userId)
                                    followers.clear()
                                    followers.addAll(fetchedFollowers)
                                    val fetchedFollowing = APISClient.getFollowing(userId)
                                    following.clear()
                                    following.addAll(fetchedFollowing)
                                    isFollowing = response.isFollowing
                                    isRequestSent = response.isRequestSent
                                    loading = false
                                } catch (e: Exception) {
                                    error = e.message ?: "Failed to load profile"
                                    loading = false
                                }
                            }
                        }) {
                            Text("Retry")
                        }
                    }
                }
                else -> {
                    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
                    userProfile?.let { profile ->
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(padding)
                        ) {
                            // Profile Header (Scrollable)
                            val coroutineScope = rememberCoroutineScope()
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState())
                                    .weight(1f, fill = false)
                            ) {
                                ProfileHeader(
                                    profile = profile,
                                    isFollowing = isFollowing,
                                    isRequestSent = isRequestSent,
                                    followLoading = followLoading,
                                    onMessageClick = {
                                        coroutineScope.launch {
                                            try {
                                                val senderId = prefs.getString("userId","").toString()
                                                val receiverId = profile.userId
                                                APISClient.sendMessageHi(senderId, receiverId)
                                            } catch (e: Exception) {
                                                Log.e("MessageError", "Failed to send message: ${e.message}")
                                            }
                                        }
                                    },
                                    onFollowClick = {
                                        scope.launch {
                                            if(!isRequestSent){
                                                try {
                                                    followLoading = true
                                                    if (isFollowing) {
                                                        APISClient.unfollowUser(userId)
                                                    } else {
                                                        APISClient.followUser(userId)
                                                    }
                                                    isFollowing = !isFollowing
                                                    followLoading = false
                                                } catch (e: Exception) {
                                                    followLoading = false
                                                    // Handle error (show snackbar, etc.)
                                                }
                                            }else{
                                                Toast.makeText(context,"Already Follow Request Sent",
                                                    Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    }
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                // Tabs
                                TabRow(selectedTabIndex = selectedTab) {
                                    Tab(
                                        selected = selectedTab == 0,
                                        onClick = { selectedTab = 0 },
                                        text = { Text("Posts") }
                                    )
                                    Tab(
                                        selected = selectedTab == 1,
                                        onClick = { selectedTab = 1 },
                                        text = { Text("Followers") }
                                    )
                                    Tab(
                                        selected = selectedTab == 2,
                                        onClick = { selectedTab = 2 },
                                        text = { Text("Following") }
                                    )
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Tab Content
                                when (selectedTab) {
                                    0 -> PostsGrid(posts = profile.posts,context)
                                    1 -> FollowersList(followers = followers ?: emptyList(), navController)
                                    2 -> FollowingList(following = following ?: emptyList(), navController)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileHeader(
    profile: UserProfileResponse,
    isFollowing: Boolean,
    isRequestSent: Boolean,
    followLoading: Boolean,
    onFollowClick: () -> Unit,
    onMessageClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Profile Picture
            val profilePictureBitmap = remember("profilePicture") { decodeBase64ToBitmap(profile.profilePicture) }
            if (profilePictureBitmap != null) {
                Image(
                    bitmap = profilePictureBitmap.asImageBitmap(),
                    contentDescription = "Profile Picture",
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .border(2.dp, MaterialTheme.colorScheme.primary, CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
            Spacer(modifier = Modifier.width(16.dp))

            // Stats
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                ProfileStat(count = profile.postsCount, label = "Posts")
                ProfileStat(count = profile.followersCount, label = "Followers")
                ProfileStat(count = profile.followingCount, label = "Following")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Name
        Text(
            text = profile.name,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        // Bio
        if (!profile.bio.isNullOrEmpty()) {
            Text(
                text = profile.bio,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Follow / Unfollow + Message Buttons
        if (isFollowing) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onFollowClick,
                    modifier = Modifier.weight(1f),
                    enabled = !followLoading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.secondary
                    )
                ) {
                    if (followLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text("Unfollow")
                    }
                }

                Button(
                    onClick = onMessageClick,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Message")
                }
            }
        } else {
            Button(
                onClick = onFollowClick,
                modifier = Modifier.fillMaxWidth(),
                enabled = !followLoading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                if (followLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Follow")
                }
            }
        }
    }
}


@Composable
fun ProfileStat(count: Int, label: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = count.toString(),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall
        )
    }
}

@Composable
fun PostsGrid(posts: List<PostItem>, context: Context) {
    if (posts.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "No posts yet",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            contentPadding = PaddingValues(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 600.dp)
        ) {
            items(posts) { post ->
                val postImageBitmap = remember("PostImage") { decodeBase64ToBitmap(post.image) }
                if(postImageBitmap != null){
                    Image(
                        bitmap = postImageBitmap.asImageBitmap(),
                        contentDescription = "Post",
                        modifier = Modifier
                            .aspectRatio(1f)
                            .clickable {
                                val intent = Intent(context, PostActivity::class.java).apply {
                                    data = Uri.parse("https://gramsnap/post/${post.id}")
                                }
                                context.startActivity(intent)
                            },
                        contentScale = ContentScale.Crop
                    )
                }
            }
        }
    }
}

@Composable
fun FollowersList(followers: List<UserItem>, navController: NavController) {
    if (followers.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "No followers yet",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        Column(modifier = Modifier.fillMaxWidth()) {
            followers.forEach { follower ->
                UserListItem(user = follower,navController)
                HorizontalDivider()
            }
        }
    }
}

@Composable
fun FollowingList(following: List<UserItem>,navController: NavController) {
    if (following.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Not following anyone yet",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        Column(modifier = Modifier.fillMaxWidth()) {
            following.forEach { user ->
                UserListItem(user = user, navController)
                HorizontalDivider()
            }
        }
    }
}

@Composable
fun UserListItem(user: UserItem, navController: NavController ) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp, horizontal = 16.dp)
            .clickable {
                navController.navigate("profile/${user.userId}")
            },
        verticalAlignment = Alignment.CenterVertically
    ) {
        val profilePictureBitmap = remember("userProfilePicture") { decodeBase64ToBitmap(user.profilePicture) }
        if(profilePictureBitmap != null){
            Image(
                bitmap = profilePictureBitmap.asImageBitmap(),
                contentDescription = "Profile Picture",
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        }else {
            Icon(Icons.Filled.AccountCircle, contentDescription = "Profile", modifier = Modifier.size(48.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))

        Column {
            Text(
                text = user.userId,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = user.name,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}