exports.accountLogin = (name) => {
  let currentDate = new Date();
  let day = currentDate.getDate(); // Get the day (1-31)
  let month = currentDate.getMonth() + 1; // Get the month (0-11, add 1 for human readable)
  let year = currentDate.getFullYear(); // Get the year (YYYY)

  let hours = currentDate.getHours(); // Get the hours (0-23)
  let minutes = currentDate.getMinutes(); // Get the minutes (0-59)
  let seconds = currentDate.getSeconds(); // Get the seconds (0-59)

  let formattedDate = `${day}/${month}/${year}`;
  let formateTime = `${hours%12}:${minutes} minutes`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Details</title>
  <style>
      /* Global styles */
      body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
      }

      .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      h2 {
          color: #333333;
          margin-bottom: 20px;
          font-size: 24px;
          text-align: center;
      }

      p {
          color: #555555;
          font-size: 16px;
          margin-bottom: 10px;
      }

      ul {
          margin-top: 0;
          padding-left: 20px;
      }

      li {
          list-style: none;
          margin-bottom: 5px;
      }

      .logo {
          text-align: center;
          margin-bottom: 20px;
      }

      .logo img {
          max-width: 150px;
          border-radius: 50%;
      }

      .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #777777;
      }

      /* Media query for responsiveness */
      @media only screen and (max-width: 600px) {
          .container {
              padding: 20px;
          }
          .logo img {
              max-width: 120px;
          }
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="logo">
          <img src="https://example.com/logo.png" alt="Anywhere Mechanic Logo">
      </div>
      <h2>Your Account Login Details on Anywhere Mechanic</h2>
      <p>Hello ${name},</p>
      <p>Your recent login details are as follows:</p>
      <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${formateTime}</li>
          <li><strong>IP Address:</strong> [IP Address]</li>
          <li><strong>Device:</strong> [Device]</li>
      </ul>
      <p>If you did not perform this action, please contact us immediately.</p>
      <div class="footer">
          <p>This email was sent to [Email]. If you received this in error, please ignore it.</p>
      </div>
  </div>
</body>
</html>
`
}