import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/task_list_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('access_token');

  runApp(MyApp(isLoggedIn: token != null));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;

  const MyApp({super.key, required this.isLoggedIn});

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
      home: isLoggedIn ? const TaskListScreen() : const LoginScreen(),
    );
  }
}
