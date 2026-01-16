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
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
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
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfileScreen(
    userId: String,
    onBack: () -> Unit,
    navController: NavController
) {
    val context = LocalContext.current
    var userProfile by remember { mutableStateOf<UserProfileResponse?>(null) }
    val followers = remember { mutableStateListOf<UserItem>() }
    val savedPosts = remember { mutableStateListOf<PostItem>() }
    val following = remember { mutableStateListOf<UserItem>() }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var selectedTab by remember { mutableStateOf(0) }

    var selectedMenuItem by remember { mutableStateOf("Profile") }

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
            val fetchSavedPosts = APISClient.getSavedPost()
            savedPosts.clear()
            savedPosts.addAll(fetchSavedPosts)
            loading = false
        } catch (e: Exception) {
            error = e.message ?: "Failed to load profile"
            loading = false
        }
    }

    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
    val profilePicture = prefs.getString("profilePicture","").toString()
    val profilePictureBitmap = remember {
        com.example.myapplication.decodeBase64ToBitmap(
            profilePicture
        )
    }

    Scaffold(

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
        },
        topBar = {
            TopAppBar(
                title = { Text(userProfile?.username ?: userId) },
                actions = {
                    IconButton(onClick = {
                        navController.navigate("settings")
                    }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings"
                        )
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
                                ProfileHeaderForUser(
                                    profile = profile
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                // Tabs
                                TabRow(selectedTabIndex = selectedTab) {
                                    Tab(
                                        selected = selectedTab == 0,
                                        onClick = { selectedTab = 0 },
                                        text = { Text("Post") }
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
                                    Tab(
                                        selected = selectedTab == 3,
                                        onClick = { selectedTab = 3 },
                                        text = { Text("Saved") }
                                    )
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Tab Content
                                when (selectedTab) {
                                    0 -> PostsGrid(posts = profile.posts,context)
                                    1 -> FollowersList(followers = followers ?: emptyList(), navController)
                                    2 -> FollowingList(following = following ?: emptyList(), navController)
                                    3 -> PostsGrid(posts = savedPosts,context)
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
fun ProfileHeaderForUser(
    profile: UserProfileResponse,
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
    }
}
