package com.example.myapplication

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import com.canhub.cropper.CropImageContract
import com.canhub.cropper.CropImageContractOptions
import com.canhub.cropper.CropImageOptions
import com.canhub.cropper.CropImageView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsActivity(
    navController: NavController,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    // User info from storage
    var currentUserId by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var bio by remember { mutableStateOf("") }
    var newUserId by remember { mutableStateOf("") }
    var isPrivate by remember { mutableStateOf(false) }
    var croppedImageUri by remember { mutableStateOf<Uri?>(null) }
    var croppedImageFile by remember { mutableStateOf<File?>(null) }

    var message by remember { mutableStateOf("") }
    var messageColor by remember { mutableStateOf(Color.Green) }
    var loading by remember { mutableStateOf(false) }

    // Initialize APISClient and load user data
    LaunchedEffect(Unit) {
        APISClient.initialize(context)
        try {
            val userInfo = APISClient.getCurrentUserInfo(context)
            currentUserId = userInfo?.userId ?: ""
            name = userInfo?.name ?: ""
            bio = userInfo?.bio ?: ""
            isPrivate = userInfo?.isPrivate ?: false
        } catch (e: Exception) {
            message = "Failed to load user info"
            messageColor = Color.Red
        }
    }

    // Image cropper launcher
    val imageCropLauncher = rememberLauncherForActivityResult(
        contract = CropImageContract()
    ) { result ->
        if (result.isSuccessful) {
            val uri = result.uriContent
            uri?.let {
                croppedImageUri = it
                // Convert URI to File
                scope.launch {
                    try {
                        val inputStream = context.contentResolver.openInputStream(uri)
                        val file = File(context.cacheDir, "cropped_profile_${System.currentTimeMillis()}.jpg")
                        inputStream?.use { input -> file.outputStream().use { output -> input.copyTo(output) } }
                        croppedImageFile = file
                    } catch (e: Exception) {
                        message = "Failed to process image"
                        messageColor = Color.Red
                    }
                }
            }
        } else {
            result.error?.let {
                message = "Crop failed: ${it.message}"
                messageColor = Color.Red
            }
        }
    }

    // Image picker launcher
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            val cropOptions = CropImageContractOptions(uri, CropImageOptions(
                guidelines = CropImageView.Guidelines.ON,
                aspectRatioX = 1,
                aspectRatioY = 1,
                fixAspectRatio = true,
                cropShape = CropImageView.CropShape.RECTANGLE,
                outputCompressFormat = android.graphics.Bitmap.CompressFormat.JPEG,
                outputCompressQuality = 90
            ))
            imageCropLauncher.launch(cropOptions)
        }
    }

    // Handle profile update
    fun handleSubmit() {
        if (name.isBlank()) {
            message = "Name is required"
            messageColor = Color.Red
            return
        }

        scope.launch {
            try {
                loading = true
                message = ""

                val response = APISClient.updateProfile(
                    name = name,
                    bio = bio,
                    isPrivate = isPrivate,
                    newUserId = newUserId.ifBlank { null },
                    profilePicture = croppedImageFile
                )

                message = "Profile updated successfully"
                messageColor = Color.Green
                APISClient.saveUserInfo(response,context)
            } catch (e: Exception) {
                message = e.message ?: "Something went wrong"
                messageColor = Color.Red
            } finally {
                loading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Profile Picture Preview
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                if (croppedImageUri != null) {
                    Image(
                        painter = rememberAsyncImagePainter(croppedImageUri),
                        contentDescription = "Profile Picture",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = "No Image",
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { imagePickerLauncher.launch("image/*") },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0095F6))
            ) {
                Text("Select from your device")
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (message.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (messageColor == Color.Green) Color(0xFFE8F5E9) else Color(0xFFFFEBEE)
                    )
                ) {
                    Text(
                        text = message,
                        color = messageColor,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }

            OutlinedTextField(
                value = currentUserId,
                onValueChange = { },
                label = { Text("Current User ID") },
                modifier = Modifier.fillMaxWidth(),
                enabled = false
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = newUserId,
                onValueChange = { newUserId = it },
                label = { Text("New User ID (optional)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = bio,
                onValueChange = { bio = it },
                label = { Text("Bio") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 4,
                maxLines = 6
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isPrivate,
                    onCheckedChange = { isPrivate = it }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Set account as private")
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { handleSubmit() },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                enabled = !loading,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                if (loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Text("Update Profile", fontSize = 16.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
// Data class for user info
data class UserInfos(
    val userId: String,
    val name: String,
    val bio: String,
    val isPrivate: Boolean,
    val profilePicture: String?
)

// Data class for update profile response
data class UpdateProfileResponse(
    val userId: String,
    val name: String,
    val bio: String,
    val profilePicture: String,
    val isPrivate: Boolean
)
fun APISClient.saveUserInfo(user: UpdateProfileResponse,context: Context) {
    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
    prefs.edit().apply {
        putString("userId", user.userId)
        putString("name", user.name)
        putString("profilePicture", user.profilePicture)
        apply()
    }
}
fun APISClient.getCurrentUserInfo(context: Context): UserInfos? {
    val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
    val userId = prefs.getString("userId", "") ?: return null
    return UserInfos(
        userId = userId,
        name = prefs.getString("name", "") ?: "",
        bio = prefs.getString("bio", "") ?: "",
        isPrivate = prefs.getBoolean("isPrivate", false),
        profilePicture = prefs.getString("profilePicture", null)
    )
}