import 'package:flutter/material.dart';

class Task {
  final String id;
  final String type;
  final String status;
  final String scheduleStart;
  final String scheduleEnd;
  final bool isLate;
  final String apartmentName;
  final double latitude;
  final double longitude;

  Task({
    required this.id,
    required this.type,
    required this.status,
    required this.scheduleStart,
    required this.scheduleEnd,
    required this.isLate,
    required this.apartmentName,
    required this.latitude,
    required this.longitude,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    // Handle nested apartment data
    final apt = json['apartment'] ?? {};
    final loc =
        apt['location'] ??
        {
          'coordinates': [0.0, 0.0],
        };

    return Task(
      id: json['id'],
      type: json['type'],
      status: json['status'],
      scheduleStart: json['schedule_start'],
      scheduleEnd: json['schedule_end'],
      isLate: json['is_late'] ?? false,
      apartmentName: apt['name'] ?? 'Bilinmeyen Apartman',
      // PostGIS coordinates are [lng, lat]
      latitude: (loc['coordinates'][1] as num).toDouble(),
      longitude: (loc['coordinates'][0] as num).toDouble(),
    );
  }

  String get localizedType {
    switch (type.toLowerCase()) {
      case 'garbage':
        return 'Çöp Toplama';
      case 'cleaning':
        return 'Temizlik';
      case 'security':
        return 'Güvenlik Turu';
      default:
        return type;
    }
  }

  IconData get icon {
    switch (type.toLowerCase()) {
      case 'garbage':
        return Icons.delete_outline;
      case 'cleaning':
        return Icons.cleaning_services;
      case 'security':
        return Icons.security;
      default:
        return Icons.task_alt;
    }
  }
}
