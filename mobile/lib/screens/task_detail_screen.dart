import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/services.dart';
import '../models/task.dart';
import '../services/task_service.dart';
import '../widgets/custom_button.dart';

class TaskDetailScreen extends StatefulWidget {
  final Task task;

  const TaskDetailScreen({super.key, required this.task});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  final TaskService _taskService = TaskService();
  bool _isLoading = false;
  String? _statusMessage;
  bool _isSuccess = false;

  Future<void> _handleStartTask() async {
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      // 1. Check Permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Konum izni reddedildi.');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception(
          'Konum izni kalıcı olarak reddedildi, ayarlardan açınız.',
        );
      }

      // 2. Get Location
      // High accuracy needed for geofencing check
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.bestForNavigation,
      );

      // Check for Mock Location (Android only usually)
      if (position.isMocked) {
        throw Exception(
          'Sahte konum algılandı! Lütfen GPS hilelerini kapatın.',
        );
      }

      // Haptic Feedback
      await HapticFeedback.heavyImpact();

      // 3. Send to Backend
      await _taskService.startTask(
        widget.task.id,
        position.latitude,
        position.longitude,
      );

      setState(() {
        _statusMessage =
            'Görev Başlatıldı! \nWhatsApp bildirimi gönderiliyor...';
        _isSuccess = true;
      });
    } catch (e) {
      setState(() {
        _statusMessage = e.toString().replaceAll('Exception: ', '');
        _isSuccess = false;
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Görev Detayı',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF1E4E76),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.task.localizedType,
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                  const SizedBox(height: 12),
                  const Text(
                    'APARTMAN',
                    style: TextStyle(
                      color: Colors.white38,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    widget.task.apartmentName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      const Icon(Icons.access_time, color: Colors.white60),
                      const SizedBox(width: 8),
                      Text(
                        '${widget.task.scheduleStart} - ${widget.task.scheduleEnd}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const Spacer(),

            if (_statusMessage != null)
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color:
                      _isSuccess
                          ? Colors.green.withOpacity(0.1)
                          : Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color:
                        _isSuccess
                            ? Colors.green.withOpacity(0.3)
                            : Colors.red.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _isSuccess ? Icons.check_circle : Icons.error,
                      color: _isSuccess ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _statusMessage!,
                        style: TextStyle(
                          color: _isSuccess ? Colors.green : Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            if (widget.task.status == 'PENDING' || widget.task.status == 'LATE')
              CustomButton(
                text: 'GÖREVİ BAŞLAT',
                onPressed: _handleStartTask,
                isLoading: _isLoading,
                color: const Color(0xFF10B981), // Green
              )
            else if (widget.task.status == 'IN_PROGRESS')
              const Center(
                child: Text(
                  'GÖREV DEVAM EDİYOR',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              )
            else
              const Center(
                child: Text(
                  'GÖREV TAMAMLANDI',
                  style: TextStyle(
                    color: Colors.white38,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    ),);
  }
}
