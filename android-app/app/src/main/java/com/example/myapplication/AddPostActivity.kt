package com.example.myapplication

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.rememberAsyncImagePainter
import com.canhub.cropper.CropImageContract
import com.canhub.cropper.CropImageContractOptions
import com.canhub.cropper.CropImageOptions
import com.canhub.cropper.CropImageView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class AddPostActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                MyAppNavHost()
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

    @Composable
    fun MyAppNavHost() {
        val navController = rememberNavController()

        NavHost(
            navController = navController,
            startDestination = "add_post"
        ) {
            composable("add_post") {
                AddPostScreen(navController)
            }
        }
    }
}
    @OptIn(ExperimentalMaterial3Api::class)
    @Preview
    @Composable
    fun AddPostScreen(navController: NavController) {
        val context = LocalContext.current
        var croppedImageUri by rememberSaveable { mutableStateOf<Uri?>(null) }
        var caption by rememberSaveable { mutableStateOf("") }
        var isUploading by remember { mutableStateOf(false) }
        var showImageSourceDialog by remember { mutableStateOf(false) }
        val tempCameraUri = remember { mutableStateOf<Uri?>(null) }
        var selectedMenuItem by remember { mutableStateOf("Add") }

        // Get userId from SharedPreferences
        val prefs = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        val userId = prefs.getString("userId", "") ?: ""

        // Crop Image Launcher with SQUARE aspect ratio
        val cropImageLauncher = rememberLauncherForActivityResult(CropImageContract()) { result ->
            if (result.isSuccessful) {
                val uri = result.uriContent
                uri?.let {
                    croppedImageUri = it
                    Toast.makeText(context, "Image Cropped!", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(context, "Cropping failed!", Toast.LENGTH_SHORT).show()
            }
        }


        // Gallery Image Picker
        val pickImageLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.GetContent()
        ) { uri: Uri? ->
            uri?.let {
                launchSquareCropper(cropImageLauncher, it)
            }
        }

        // Camera Capture
        val takePictureLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.TakePicture()
        ) { success ->
            if (success) {
                tempCameraUri.value?.let {
                    launchSquareCropper(cropImageLauncher, it)
                }
            } else {
                Toast.makeText(context, "Camera capture failed", Toast.LENGTH_SHORT).show()
            }
        }
        // Permission Launcher
        val cameraPermissionLauncher = rememberLauncherForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) {
                // Permission granted, launch camera
                captureImageFromCamera(context, takePictureLauncher, tempCameraUri)
            } else {
                Toast.makeText(context, "Camera permission denied", Toast.LENGTH_SHORT).show()
            }
        }

        fun onCameraSelected() {
            // Check if permission already granted
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                captureImageFromCamera(context, takePictureLauncher, tempCameraUri)
            } else {
                // Request permission
                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }



        val prefst = context.getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        val profilePicture = prefst.getString("profilePicture","").toString()
        val profilePictureBitmap = remember {
            com.example.myapplication.decodeBase64ToBitmap(
                profilePicture
            )
        }

        // Image Source Selection Dialog
        if (showImageSourceDialog) {
            AlertDialog(
                onDismissRequest = { showImageSourceDialog = false },
                title = { Text("Select Image Source") },
                text = { Text("Choose where to get your image from") },
                confirmButton = {
                    TextButton(onClick = {
                        showImageSourceDialog = false
                        pickImageLauncher.launch("image/*")
                    }) { Text("Gallery") }
                },
                dismissButton = {
                    TextButton(onClick = {
                        showImageSourceDialog = false
                        onCameraSelected()
                    }) { Text("Camera") }
                }
            )
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Add Post", fontWeight = FontWeight.Bold) },
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
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    when {
                        // No image selected - Show selection UI
                        croppedImageUri == null -> {
                            Icon(
                                imageVector = Icons.Default.AddAPhoto,
                                contentDescription = "Add Photo",
                                modifier = Modifier.size(100.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Select an Image",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { showImageSourceDialog = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF0095F6)
                                )
                            ) {
                                Text("Select from your device")
                            }
                        }

                        // Image cropped - Show post creation UI
                        else -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Final Image",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(16.dp))

                                // Display Cropped Image
                                Card(
                                    modifier = Modifier
                                        .size(300.dp)
                                        .aspectRatio(1f),
                                    shape = RoundedCornerShape(8.dp),
                                    elevation = CardDefaults.cardElevation(4.dp)
                                ) {
                                    Image(
                                        painter = rememberAsyncImagePainter(croppedImageUri),
                                        contentDescription = "Cropped Image",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                }

                                Spacer(modifier = Modifier.height(24.dp))

                                // Caption Input
                                OutlinedTextField(
                                    value = caption,
                                    onValueChange = { caption = it },
                                    label = { Text("Write a caption...") },
                                    modifier = Modifier.fillMaxWidth(),
                                    minLines = 3,
                                    maxLines = 5
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                // Post Button
                                Button(
                                    onClick = {
                                        if (croppedImageUri != null) {
                                            isUploading = true
                                            CoroutineScope(Dispatchers.IO).launch {
                                                val success = uploadPost(
                                                    context,
                                                    croppedImageUri!!,
                                                    userId,
                                                    caption
                                                )
                                                withContext(Dispatchers.Main) {
                                                    isUploading = false
                                                    if (success) {
                                                        Toast.makeText(
                                                            context,
                                                            "Post uploaded successfully!",
                                                            Toast.LENGTH_SHORT
                                                        ).show()
                                                    } else {
                                                        Toast.makeText(
                                                            context,
                                                            "Failed to upload post",
                                                            Toast.LENGTH_SHORT
                                                        ).show()
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    enabled = !isUploading && caption.isNotEmpty(),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF0095F6)
                                    )
                                ) {
                                    Text(
                                        text = if (isUploading) "Uploading..." else "Post",
                                        fontSize = 16.sp
                                    )
                                }

                                // Change Image Button
                                if (!isUploading) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    TextButton(
                                        onClick = {
                                            croppedImageUri = null
                                            caption = ""
                                        }
                                    ) {
                                        Text("Change Image")
                                    }
                                }
                            }
                        }
                    }
                }

                // Loading Overlay
                if (isUploading) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.5f)),
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
                                text = "Uploading Post...",
                                color = Color.White,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }
    }


fun launchSquareCropper(
    launcher: androidx.activity.result.ActivityResultLauncher<CropImageContractOptions>,
    uri: Uri
) {
    val options = CropImageOptions().apply {
        cropShape = CropImageView.CropShape.RECTANGLE
        guidelines = CropImageView.Guidelines.ON
        fixAspectRatio = true  // Lock aspect ratio
        aspectRatioX = 1       // Square ratio
        aspectRatioY = 1       // Square ratio
    }
    val contractOptions = CropImageContractOptions(uri, options)
    launcher.launch(contractOptions)
}

// Capture image from camera
fun captureImageFromCamera(
    context: Context,
    launcher: androidx.activity.result.ActivityResultLauncher<Uri>,
    tempImageUri: MutableState<Uri?>
) {
    val photoFile = File(context.cacheDir, "temp_post_${System.currentTimeMillis()}.jpg")
    val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        photoFile
    )
    tempImageUri.value = uri
    launcher.launch(uri)
}

// Upload post with image and caption
suspend fun uploadPost(
    context: Context,
    imageUri: Uri,
    userId: String,
    caption: String
): Boolean {
    return try {
        val inputStream: InputStream? = context.contentResolver.openInputStream(imageUri)
        val tempFile = File(context.cacheDir, "post_upload_${System.currentTimeMillis()}.jpg")
        val outputStream = FileOutputStream(tempFile)
        inputStream?.copyTo(outputStream)
        inputStream?.close()
        outputStream.close()

        // Build multipart form data
        val requestBody = MultipartBody.Builder().setType(MultipartBody.FORM)
            .addFormDataPart("userId", userId)
            .addFormDataPart("caption", caption)
            .addFormDataPart(
                "image",
                tempFile.name,
                tempFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
            )
            .build()

        // Create OkHttp client with cookie jar
        val client = OkHttpClient.Builder()
            .cookieJar(PersistentCookieJar(context))
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .build()

        val request = Request.Builder()
            .url("https://backend-eror.onrender.com/createPost")
            .post(requestBody)
            .build()

        // Execute request
        val response = client.newCall(request).execute()
        val success = response.isSuccessful
        if(success){
            val responseBody = response.body?.string()
            val json = JSONObject(responseBody)
            val postId = json.getJSONObject("post").getString("_id")
            val intent = Intent(context, PostActivity::class.java).apply {
                data = Uri.parse("https://gramsnap/post/${postId}")
            }
            context.startActivity(intent)
        }
        Log.d("UploadPost", "Response: ${response.code} - ${response.message}")
        response.close()
        tempFile.delete()
        success
    } catch (e: Exception) {
        Log.e("UploadPost", "Upload failed: ${e.message}", e)
        false
    }
}