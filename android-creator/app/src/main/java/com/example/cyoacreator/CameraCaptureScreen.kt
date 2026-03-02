package com.example.cyoacreator

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Environment
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.PendingRecording
import androidx.camera.video.Quality
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import java.io.File

@Composable
fun CameraCaptureScreen(
  expectedVideoFile: String,
  onDone: (Uri) -> Unit,
  onCancel: () -> Unit
) {
  val context = LocalContext.current
  val lifecycleOwner = LocalLifecycleOwner.current
  val previewView = remember { PreviewView(context) }
  val recorder = remember {
    Recorder.Builder()
      .setQualitySelector(androidx.camera.video.QualitySelector.from(Quality.HD))
      .build()
  }
  val videoCapture = remember { VideoCapture.withOutput(recorder) }

  var recording by remember { mutableStateOf<Recording?>(null) }
  var status by remember { mutableStateOf("Ready") }

  val hasCameraPermission = ContextCompat.checkSelfPermission(
    context,
    Manifest.permission.CAMERA
  ) == PackageManager.PERMISSION_GRANTED

  val hasAudioPermission = ContextCompat.checkSelfPermission(
    context,
    Manifest.permission.RECORD_AUDIO
  ) == PackageManager.PERMISSION_GRANTED

  LaunchedEffect(hasCameraPermission, lifecycleOwner) {
    if (!hasCameraPermission) return@LaunchedEffect

    val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
    cameraProviderFuture.addListener({
      val cameraProvider = cameraProviderFuture.get()
      val preview = Preview.Builder().build().also {
        it.surfaceProvider = previewView.surfaceProvider
      }
      cameraProvider.unbindAll()
      cameraProvider.bindToLifecycle(
        lifecycleOwner,
        CameraSelector.DEFAULT_BACK_CAMERA,
        preview,
        videoCapture
      )
    }, ContextCompat.getMainExecutor(context))
  }

  Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
    AndroidView(
      factory = { previewView },
      modifier = Modifier.fillMaxSize()
    )

    Column(
      modifier = Modifier
        .align(Alignment.BottomCenter)
        .fillMaxWidth()
        .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      Text(
        text = "Capture clip: $expectedVideoFile",
        color = MaterialTheme.colorScheme.onBackground
      )
      Text(text = status, color = MaterialTheme.colorScheme.onBackground)

      Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = {
          if (!hasCameraPermission) {
            status = "Camera permission required"
            return@Button
          }

          if (recording == null) {
            val outputFile = createOutputFile(context, expectedVideoFile)
            val outputOptions = FileOutputOptions.Builder(outputFile).build()
            var pending: PendingRecording = videoCapture.output
              .prepareRecording(context, outputOptions)
            if (hasAudioPermission) {
              pending = pending.withAudioEnabled()
            }

            recording = pending.start(ContextCompat.getMainExecutor(context)) { event ->
              when (event) {
                is VideoRecordEvent.Start -> status = "Recording..."
                is VideoRecordEvent.Finalize -> {
                  recording = null
                  if (event.hasError()) {
                    status = "Recording failed (${event.error})"
                  } else {
                    status = "Saved"
                    onDone(Uri.fromFile(outputFile))
                  }
                }
              }
            }
          } else {
            recording?.stop()
          }
        }) {
          Text(if (recording == null) "Record" else "Stop")
        }

        Button(onClick = {
          recording?.stop()
          onCancel()
        }) {
          Text("Cancel")
        }
      }
    }
  }
}

private fun createOutputFile(context: Context, expectedVideoFile: String): File {
  val outputDir = File(
    context.getExternalFilesDir(Environment.DIRECTORY_MOVIES),
    "cyoa-capture"
  ).apply { mkdirs() }
  return File(outputDir, expectedVideoFile)
}
