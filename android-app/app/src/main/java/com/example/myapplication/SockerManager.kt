package com.example.myapplication

import android.content.Context
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

object SocketManager {
    private var socket: Socket? = null
    private var client: OkHttpClient? = null

    fun getSocket(): Socket? = socket

    private fun initSocket() {
        if (socket == null) {
            socket = IO.socket("https://backend-eror.onrender.com")
        }
    }

    suspend fun connect(context: Context) {
        initSocket()

        if (client == null) {
            client = OkHttpClient.Builder()
                .cookieJar(PersistentCookieJar(context))
                .build()
        }

        val request = Request.Builder()
            .url("https://backend-eror.onrender.com/protected")
            .get()
            .build()

        withContext(Dispatchers.IO) {
            try {
                client!!.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val jsonResponse = response.body?.string()
                        val json = JSONObject(jsonResponse ?: "{}")
                        val user = json.getJSONObject("user")
                        val userId = user.getString("userId")

                        socket?.connect()
                        socket?.on(Socket.EVENT_CONNECT) {
                            socket?.emit("userConnected", userId)
                            println("✅ Connected and emitted userConnected: $userId")
                        }
                    } else {
                        println("❌ Auth failed: ${response.code}")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun listenForEvents(
        onUserOnline: (String) -> Unit,
        onUserOffline: (String, String?) -> Unit,
        onMessageReceived: (JSONObject) -> Unit,
        onMessageSeen: (JSONObject) -> Unit
    ) {
        socket?.on("userOnline") { args ->
            val data = args[0] as JSONObject
            val userId = data.optString("userId")
            println("🟢 User online: $userId")
            onUserOnline(userId)
        }

        socket?.on("userOffline") { args ->
            val data = args[0] as JSONObject
            val userId = data.optString("userId")
            val lastSeen = data.optString("lastSeen")
            println("🔴 User offline: $userId at $lastSeen")
            onUserOffline(userId, lastSeen)
        }

        socket?.on("receiveMessage") { args ->
            val data = args[0] as JSONObject
            println("📩 New message received: $data")
            onMessageReceived(data)
        }

        socket?.on("markMessageSee") { args ->
            val data = args[0] as JSONObject
            println("👁 Message seen: $data")
            onMessageSeen(data)
        }
    }

    fun emitSendMessage(messageJson: JSONObject) {
        socket?.emit("sendMessage", messageJson)
        println("📤 Emitted sendMessage: $messageJson")
    }

    fun emitMarkMessageSeen(messageJson: JSONObject) {
        socket?.emit("markMessageSeen", messageJson)
        println("👁 Emitted markMessageSeen: $messageJson")
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
        println("🔌 Socket disconnected")
    }
}
