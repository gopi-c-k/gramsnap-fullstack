package com.example.myapplication

import android.content.Context
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.tooling.preview.Preview
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

// Data classes
data class UserSearchResult(
    @SerializedName("userId") val userId: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String? = null,
    @SerializedName("profilePicture") val profilePicture: String? = null
)



// OkHttpClient singleton
object ApiClient {
    val client = OkHttpClient.Builder()
        .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    val gson = Gson()
}

@OptIn(ExperimentalMaterial3Api::class)
@Preview
@Composable
fun SearchScreen(navController: NavController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var searchTerm by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<UserSearchResult>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }
    var selectedUser by remember { mutableStateOf<UserSearchResult?>(null) }
    var selectedMenuItem by remember { mutableStateOf("Search") }
    var errorMessage by remember { mutableStateOf<String?>(null) }


    // Search function using OkHttpClient
    fun performSearch(term: String) {
        if (term.isEmpty()) {
            searchResults = emptyList()
            return
        }

        scope.launch {
            isSearching = true
            errorMessage = null
            try {
                val result = withContext(Dispatchers.IO) {
                    val url = "https://backend-eror.onrender.com/search/$term"

                    val requestBody = "{}".toRequestBody("application/json".toMediaType())

                    val request = Request.Builder()
                        .url(url)
                        .post(requestBody)
                        .build()

                    val response = ApiClient.client.newCall(request).execute()

                    if (response.isSuccessful) {
                        val responseBody = response.body?.string()
                        responseBody?.let {
                            ApiClient.gson.fromJson(
                                it,
                                Array<UserSearchResult>::class.java
                            ).toList()
                        } ?: emptyList()
                    } else {
                        throw IOException("HTTP ${response.code}: ${response.message}")
                    }
                }
                searchResults = result
            } catch (e: Exception) {
                println("Error occurred: ${e.message}")
                errorMessage = "Search failed. Please try again."
                searchResults = emptyList()
            } finally {
                isSearching = false
            }
        }
    }

    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
    val profilePicture = prefs.getString("profilePicture","").toString()
    val profilePictureBitmap = remember { decodeBase64ToBitmap(profilePicture) }

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

                            navController.navigate(item.lowercase()) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (selectedUser != null) {
                // Show User Profile
                CommonProfileScreen(
                    userId = selectedUser!!.userId,
                    onBack = { selectedUser = null },
                    navController
                )
            } else {
                // Show Search Interface
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Top
                ) {
                    Spacer(modifier = Modifier.height(32.dp))

                    // Search Bar
                    OutlinedTextField(
                        value = searchTerm,
                        onValueChange = {
                            searchTerm = it
                            performSearch(it)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        placeholder = { Text("Search…") },
                        leadingIcon = {
                            Icon(
                                Icons.Filled.Search,
                                contentDescription = "Search",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        trailingIcon = {
                            if (searchTerm.isNotEmpty()) {
                                IconButton(onClick = {
                                    searchTerm = ""
                                    searchResults = emptyList()
                                    errorMessage = null
                                }) {
                                    Icon(
                                        Icons.Filled.Clear,
                                        contentDescription = "Clear",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        },
                        shape = RoundedCornerShape(20.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                            focusedBorderColor = MaterialTheme.colorScheme.primary
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Error Message
                    if (errorMessage != null) {
                        Text(
                            text = errorMessage!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }

                    // Search Results
                    if (searchTerm.isNotEmpty()) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 400.dp),
                            shape = RoundedCornerShape(12.dp),
                            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                        ) {
                            if (isSearching) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator()
                                }
                            } else if (searchResults.isEmpty() && errorMessage == null) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No results found",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            } else if (searchResults.isNotEmpty()) {
                                LazyColumn {
                                    items(searchResults) { result ->
                                        SearchResultItem(
                                            result = result,
                                            onClick = { selectedUser = result }
                                        )
                                        if (result != searchResults.last()) {
                                            HorizontalDivider()
                                        }
                                    }
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
fun SearchResultItem(
    result: UserSearchResult,
    onClick: () -> Unit
) {
    val context = LocalContext.current

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Profile Picture
        val resultProfilePictureBitmap = remember("resultProfilePicture") { decodeBase64ToBitmap(result.profilePicture) }
        if (resultProfilePictureBitmap != null) {
            Image(
                bitmap = resultProfilePictureBitmap.asImageBitmap(),
                contentDescription = "Profile Picture",
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop

            )
        } else {
            Icon(
                Icons.Filled.AccountCircle,
                contentDescription = "Default Profile",
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        // User Info
        Column {
            Text(
                text = result.userId,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = result.name,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
