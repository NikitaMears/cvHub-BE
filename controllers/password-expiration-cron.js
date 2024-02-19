const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { Sequelize, Op } = require('sequelize');
// Cron to run every day at midnight
//cron.schedule('* * * * *', async () => {
    cron.schedule('0 0 * * *', async () => {
try{

  const twoWeeksAgo = new Date(Date.now() - 12096e5);
  //const oneDayAgo = new Date(Date.now() - 86400000);

  // Find users whose passwordChangedAt is older than 2 weeks
  const users = await User.findAll({
    where: {
        lastPasswordChange: { [Op.lte]: twoWeeksAgo } 
    }
  });

  // Send email reminder to each user
  users.forEach(async (user) => {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'minasmelaku@gmail.com',
        pass: 'sxmbwmvwdcftismt' 
      }
    });

    let mailOptions = {
      from: 'minasmelaku@gmail.com',
      to: user.email,
      subject: 'Time to change your password!',
      html: `
      <body style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; padding: 10px; background-color: #f2f2f2;">

  <header style="background-color: #333; color: white; padding: 1rem;">
    <h1 style="font-size: 24px; margin: 0;">Time to Change Your Password!</h1> 
  </header>

  <main style="background-color: white; padding: 1rem; border-radius: 5px;">
    <p style="font-size: 18px; font-weight: bold;">Dear User,</p>

    <p>Your password is older than 15 days. Please <a href="https://yehamaps.com/reset-password" target="_blank" style="color: #008000; text-decoration: none;">click here</a> and reset it now.</p>
    
    <p>If you have any trouble resetting your password, please contact our support team at <a href="mailto:yehamaps@example.com" target="_blank" style="color: #008000; text-decoration: none;">support@example.com</a>.</p>

    <p>For your security, it's important that you regularly update your password. Please reset it as soon as possible.</p>

    <p>Best Regards,<br>Yeha Team</p>
  </main>
  
  <footer style="background-color: #333; color: white; padding: 0.5rem; text-align: center; font-size: 0.85rem;">
    &copy; 2023 Yeha Maps
  </footer>

</body>
    ` 
    };

    let info = await transporter.sendMail(mailOptions);

  });
}
catch(error){
    console.log("err", error)
}



});