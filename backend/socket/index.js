module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
    
    // Add order-related socket events
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });
    
    socket.on('join-delivery-room', (deliveryGuyId) => {
      socket.join(`delivery-${deliveryGuyId}`);
      console.log(`Delivery person ${deliveryGuyId} joined their room`);
    });
    
    socket.on('order-status-update', (data) => {
      console.log('Order status update received:', data);
      
      // Broadcast to all clients
      io.emit('order-status-updated', data);
      
      // Also send to specific delivery person if assigned
      if (data.order && data.order.delivery_guy_id) {
        io.to(`delivery-${data.order.delivery_guy_id}`).emit('delivery-order-updated', data);
      }
      
      // Send to admin room
      io.to('admin-room').emit('admin-order-updated', data);
    });
  });
};


