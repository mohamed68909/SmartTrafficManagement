// android/app/src/main/kotlin/com/autocare/app/MainActivity.kt
package com.autocare.app

import io.flutter.embedding.android.FlutterFragmentActivity

// flutter_stripe requires FlutterFragmentActivity (not FlutterActivity)
// This is required for the Stripe PaymentSheet to work properly on Android.
class MainActivity : FlutterFragmentActivity()
