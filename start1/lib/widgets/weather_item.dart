import 'package:flutter/material.dart';

class weatherItem extends StatelessWidget {
  const weatherItem({
    super.key,
    required this.value, required this.text, required this.unit, required this.imageUrl,
  });

  final int value;
  final String text;
  final String unit;
  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(text, style: const TextStyle(
          color: Colors.black54,
        ),),
        const SizedBox(
          height: 8,
        ),
        Container(
          padding: const EdgeInsets.all(10.0),
          height: 60,
          width: 60,
          decoration: const BoxDecoration(
            color: Color(0xffE0E8FB),
            borderRadius: BorderRadius.all(Radius.circular(18)),
          ),
          child: Image.asset(imageUrl),
        ),
        const SizedBox(
          height: 50,
        ),
        Text(value.toString() + "km/h", style: const TextStyle(
          fontWeight: FontWeight.bold,
        ),),

      ],   // children
    );
  }
}


class WeatherItemHumid extends StatelessWidget {
  const WeatherItemHumid({
    super.key,
    required this.value,
    required this.text,
    required this.unit,
    required this.imageUrl,
  });

  final int value;
  final String text;
  final String unit; // Dynamic unit
  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Item title (e.g., "Wind Speed", "Humidity")
        Text(
          text,
          style: const TextStyle(
            color: Colors.black54,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 8),

        // Image container
        Container(
          padding: const EdgeInsets.all(10.0),
          height: 60,
          width: 60,
          decoration: const BoxDecoration(
            color: Color(0xffE0E8FB),
            borderRadius: BorderRadius.all(Radius.circular(18)),
          ),
          child: Image.asset(imageUrl),
        ),
        const SizedBox(height: 16),

        // Value with unit (e.g., "10 km/h", "70%")
        Text(
          '$value $unit',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ],
    );
  }
}
