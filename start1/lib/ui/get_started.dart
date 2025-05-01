import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'welcome.dart';
import '../models/constants.dart';

class GetStarted extends StatefulWidget {
  const GetStarted({super.key});

  @override
  State<GetStarted> createState() => _GetStartedState();
}

class _GetStartedState extends State<GetStarted> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool isLogin = true; // toggle between login/register
  String errorMessage = '';

  final FlutterSecureStorage secureStorage = FlutterSecureStorage();

  Future<void> authenticate() async {
    final url = isLogin
        ? Uri.parse("https://22c8-1-55-44-153.ngrok-free.app/api/login")

        : Uri.parse("https://22c8-1-55-44-153.ngrok-free.app/api/register");

    try {
      final res = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: json.encode({
          "email": _emailController.text,
          "password": _passwordController.text,
        }),
      );

      final data = json.decode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        if (isLogin) {
          // Use flutter_secure_storage for token storage
          await secureStorage.write(key: 'jwt_token', value: data["token"]);
          Navigator.pushReplacement(
              context, MaterialPageRoute(builder: (_) => const Welcome()));
        } else {
          setState(() {
            isLogin = true;
            errorMessage = "Registered successfully. You can now log in.";
          });
        }
      } else {
        setState(() {
          errorMessage = data["error"] ?? "Something went wrong.";
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = "Failed to connect to server.";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    Constants myConstants = Constants();
    Size size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        width: size.width,
        height: size.height,
        color: myConstants.primaryColor.withOpacity(.5),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Column(
              children: [
                Image.asset('assets/get-started.png'),
                const SizedBox(height: 20),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: "Email"),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: "Password"),
                ),
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: authenticate,
                  child: Container(
                    height: 50,
                    width: size.width * 0.7,
                    decoration: BoxDecoration(
                      color: myConstants.primaryColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(
                        isLogin ? 'Login' : 'Register',
                        style:
                            const TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                TextButton(
                  onPressed: () {
                    setState(() {
                      isLogin = !isLogin;
                      errorMessage = '';
                    });
                  },
                  child: Text(
                    isLogin
                        ? "Don't have an account? Register"
                        : "Already have an account? Login",
                  ),
                ),
                if (errorMessage.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Text(errorMessage,
                        style: const TextStyle(color: Colors.red)),
                  )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
