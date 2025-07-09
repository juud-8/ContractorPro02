import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainNavigationPage extends StatefulWidget {
  final Widget child;
  
  const MainNavigationPage({
    Key? key,
    required this.child,
  }) : super(key: key);
  
  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage> {
  int _selectedIndex = 0;
  
  final List<NavigationItem> _navigationItems = [
    NavigationItem(
      icon: Icons.dashboard_outlined,
      activeIcon: Icons.dashboard,
      label: 'Dashboard',
      route: '/dashboard',
    ),
    NavigationItem(
      icon: Icons.receipt_long_outlined,
      activeIcon: Icons.receipt_long,
      label: 'Invoices',
      route: '/invoices',
    ),
    NavigationItem(
      icon: Icons.people_outline,
      activeIcon: Icons.people,
      label: 'Clients',
      route: '/clients',
    ),
    NavigationItem(
      icon: Icons.request_quote_outlined,
      activeIcon: Icons.request_quote,
      label: 'Quotes',
      route: '/quotes',
    ),
    NavigationItem(
      icon: Icons.more_horiz,
      activeIcon: Icons.more_horiz,
      label: 'More',
      route: '/settings',
    ),
  ];
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateSelectedIndex();
  }
  
  void _updateSelectedIndex() {
    final location = GoRouterState.of(context).uri.path;
    final index = _navigationItems.indexWhere((item) => location.startsWith(item.route));
    if (index != -1) {
      setState(() {
        _selectedIndex = index;
      });
    }
  }
  
  void _onItemTapped(int index) {
    if (index != _selectedIndex) {
      context.go(_navigationItems[index].route);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        items: _navigationItems.map((item) {
          final isSelected = _navigationItems.indexOf(item) == _selectedIndex;
          return BottomNavigationBarItem(
            icon: Icon(isSelected ? item.activeIcon : item.icon),
            label: item.label,
          );
        }).toList(),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;
  
  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
  });
}