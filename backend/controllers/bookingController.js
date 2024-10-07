import bookingModel from "../models/bookingModel.js";
import Razorpay from "razorpay";
import dotenv from 'dotenv';
import Twilio from 'twilio';
import ImageKit from 'imagekit';
import QRCode from 'qrcode';

dotenv.config();

// Initialize services
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const twilioClient = new Twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Send WhatsApp message with Twilio
const sendWhatsappMessage = async (to, message, qrCodeUrl) => {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.WHATSAPP_NO}`,
      to: `whatsapp:${+919188249981}`,
      mediaUrl: [qrCodeUrl],
    });
    console.log("Message sent, SID:", response.sid);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw new Error("Failed to send WhatsApp message");
  }
};

// Create a new booking and initiate Razorpay order
export const placeBooking = async (req, res) => {
  const { movieName, theatreName, showtime, date, bookedSeats, totalPrice, userId } = req.body;

  try {

    const existingBookings = await bookingModel.find({
      theatreName,
      showtime,
      date,
      bookedSeats: { $in: bookedSeats }, // Check if any of the selected seats are already booked
    });

    if (existingBookings.length > 0) {
      const alreadyBookedSeats = existingBookings.flatMap(booking => booking.bookedSeats);
      const conflictingSeats = bookedSeats.filter(seat => alreadyBookedSeats.includes(seat));

      return res.status(400).json({
        success: false,
        message: `The following seats are already booked: ${conflictingSeats.join(", ")}.`,
      });
    }

    const orderOptions = {
      amount: totalPrice * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpayInstance.orders.create(orderOptions);

    const newBooking = new bookingModel({
      movieName,
      theatreName,
      showtime,
      date,
      bookedSeats,
      totalPrice,
      razorpayOrderId: order.id,
      paymentStatus: "pending",
      userId: userId || req.user?.id,
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({
      success: true,
      message: "Booking placed, awaiting payment.",
      orderId: order.id,
      amount: orderOptions.amount,
      currency: orderOptions.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error placing booking:", error);
    res.status(500).json({ success: false, message: "Failed to place booking" });
  }
};

// Handle payment success and update booking
export const handlePaymentSuccess = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id } = req.body;

  try {
    const booking = await bookingModel.findOne({ razorpayOrderId: razorpay_order_id });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
    if (paymentDetails.status === "captured") {
      booking.paymentStatus = "confirmed";
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save();

      // Generate and upload QR code
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(booking));
      const uploadedQR = await imagekit.upload({ file: qrCodeUrl, fileName: "qr-code.png" });

      const message = `Hi! Your booking for *${booking.movieName}* at *${booking.theatreName}* on *${new Date(booking.date).toLocaleDateString('en-IN')}* is confirmed 🎊. Seats: *${booking.bookedSeats.join(", ")}*.\nThank you for booking! Happy watching🎥`;
      await sendWhatsappMessage(booking.userId, message, uploadedQR.url);

      res.json({ success: true, message: "Payment confirmed, booking successful.", booking });
    } else {
      booking.paymentStatus = "failed";
      await booking.save();
      res.status(400).json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Error processing payment" });
  }
};

// List all bookings
// List bookings for a specific movie, theatre, date, and showtime
export const listBookings = async (req, res) => {
  const { movieName, theatreName, date, showtime } = req.query;

  try {
    // Construct the query object dynamically
    const query = { userId: req.user.id }; // Filter by userId
    
    if (movieName) query.movieName = movieName;
    if (theatreName) query.theatreName = theatreName;
    if (showtime) query.showtime = showtime;
    
    // Check if the date is valid before including it in the query
    if (date && !isNaN(Date.parse(date))) {
      query.date = new Date(date); // Convert to a valid date object
    }

    // Find all bookings for the specific user and provided filters
    const bookings = await bookingModel.find(query);

    // Collect booked seats and add it to each booking detail
    const bookingsWithSeats = bookings.map(booking => ({
      ...booking.toObject(), // Convert mongoose object to plain JavaScript object
      bookedSeats: booking.bookedSeats, // Add booked seats to the booking details
    }));

    res.json({ success: true, data: bookingsWithSeats });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

