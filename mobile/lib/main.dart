import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MYB Personel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF1E4E76),
        scaffoldBackgroundColor: const Color(0xFF0F1E2E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF1E4E76),
          secondary: Color(0xFF10B981),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
