import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/dashboard_bloc.dart';
import '../widgets/dashboard_stats_card.dart';
import '../widgets/recent_invoices_card.dart';
import '../widgets/quick_actions_card.dart';
import '../widgets/notifications_card.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  @override
  void initState() {
    super.initState();
    context.read<DashboardBloc>().add(LoadDashboardEvent());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // Handle notifications
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notifications coming soon!')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.go('/settings'),
          ),
        ],
      ),
      body: BlocBuilder<DashboardBloc, DashboardState>(
        builder: (context, state) {
          if (state is DashboardLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          
          if (state is DashboardError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    'Error: ${state.message}',
                    style: Theme.of(context).textTheme.titleMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<DashboardBloc>().add(LoadDashboardEvent());
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          if (state is DashboardLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<DashboardBloc>().add(LoadDashboardEvent());
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Welcome message
                  Text(
                    'Welcome back!',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Here\'s what\'s happening with your business today',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Quick actions
                  QuickActionsCard(),
                  const SizedBox(height: 16),
                  
                  // Stats overview
                  DashboardStatsCard(stats: state.stats),
                  const SizedBox(height: 16),
                  
                  // Recent invoices
                  RecentInvoicesCard(invoices: state.recentInvoices),
                  const SizedBox(height: 16),
                  
                  // Notifications
                  NotificationsCard(notifications: state.notifications),
                  const SizedBox(height: 16),
                  
                  // Recent activity placeholder
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Recent Activity',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: 3,
                            separatorBuilder: (context, index) => const Divider(),
                            itemBuilder: (context, index) {
                              final activities = [
                                'Invoice INV-2024-001 sent to John Smith',
                                'Payment received from Tech Solutions Inc.',
                                'Quote QUO-2024-001 approved by Sarah Johnson',
                              ];
                              return ListTile(
                                leading: const Icon(Icons.activity_zone),
                                title: Text(activities[index]),
                                subtitle: Text('${index + 1} hours ago'),
                                contentPadding: EdgeInsets.zero,
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
          
          return const Center(child: Text('No data available'));
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/invoices/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}