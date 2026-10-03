    <!-- Admin Core Script -->
    <script src="/admin/js/admin.js"></script>
    <?php
    $current_script_view = $_GET['view'] ?? 'dashboard';
    
    // Conditionally load dependencies like Chart.js only on views that require them
    if ($current_script_view === 'dashboard') {
        echo '    <script src="/admin/js/chart.min.js"></script>';
    }
    
    $allowed_script_views = ['dashboard', 'clientes', 'productos', 'pedidos', 'ticket', 'configuracion'];
    if (in_array($current_script_view, $allowed_script_views)) {
        echo '    <script src="/admin/js/' . htmlspecialchars($current_script_view) . '.js"></script>';
    }
    ?>
</body>
</html>
