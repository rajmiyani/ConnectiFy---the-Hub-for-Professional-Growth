import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../../Config/prisma.js" // Prisma is our connection to the "Filing Cabinet" (PostgreSQL)
import { AppError } from "../../Middleware/GlobalErrorHandler.js"
import { addEmailToQueue } from "../../Queue/emailQueue.js" // Queue allows us to send emails in the background
import { emailTemplates } from "../../Utils/EmailTemplates.js" // Professional HTML designs for our emails
import redisClient from "../../Config/redis.js" // Redis is our "Sticky Note" storage for temporary data like OTPs
import { generateOTP } from "../../Utils/otpGenerator.js"
import crypto from "crypto" // Used for generating long, secure random strings
import { getIO } from "../../Config/socket.js"

/**
 * ==============================================================================
 * REGISTER CONTROLLER
 * Goal: Create a new user account and send an OTP for verification.
 * ==============================================================================
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      accountType,
      fullName,
      username,
      email,
      phone,
      dob,
      gender,
      educationLevel,
      university,
      courseName,
      startYear,
      passingYear,
      cgpa,
      interest,
      currentEducation,
      country,
      state,
      city,
      occupation,
      lookingFor,
      headline,
      bio,
      skills,
      linkedin,
      portfolio,
      resume,
      profileImg,
      password,
      confirmPassword,
      pin,
      profileVisibility,
    } = req.body

    /* ===================== BASIC VALIDATION ===================== */
    // Why: We check these first to stop the process early if the data is incomplete.
    if (!fullName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Required fields are missing: fullName, username, email, password",
      })
    }

    // Why: Ensure the user typed their password correctly twice.
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      })
    }

    // Why: Short passwords are easy to hack. Minimum 8 characters is a security standard.
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      })
    }

    /* ===================== CHECK EXISTING USER ===================== */
    // Why: We can't have two people with the same email or username.
    // Analogy: Checking if a folder with this name already exists in our Filing Cabinet.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      },
      select: { id: true }
    })

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email or username",
      })
    }

    /* ===================== HASH PASSWORD ===================== */
    // Why: NEVER store passwords as plain text. If the database leaks, hackers see nothing.
    // Analogy: Turning the password into a complex scrambled code that can't be unscrambled.
    const hashedPassword = await bcrypt.hash(password, 10)

    /* ===================== NAME SPLITTING ===================== */
    // Why: Frontend sends "John Doe", but our DB prefers "John" and "Doe" in separate slots.
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || ""

    /* ===================== CREATE USER ===================== */
    // Why: This is the actual command to save the user into the "Filing Cabinet" (PostgreSQL).
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        accountType: accountType || "user",
        phone: phone || null,
        dob: dob ? new Date(dob) : null,
        gender: gender ? gender.toLowerCase() : null,
        educationLevel: educationLevel || null,
        university: university || null,
        courseName: courseName || null,
        startYear: startYear || null,
        passingYear: passingYear || null,
        cgpa: cgpa || null,
        interest: interest || null,
        currentEducation: currentEducation || false,
        country: country || null,
        state: state || null,
        city: city || null,
        occupation: occupation || null,
        lookingFor: lookingFor || null,
        headline: headline || null,
        bio: bio || null,
        skills: skills || null,
        linkedin: linkedin || null,
        portfolio: portfolio || null,
        resume: (typeof resume === 'string' && resume) ? resume : null,
        profileImg: (typeof profileImg === 'string' && profileImg) ? profileImg : null,
        pin: pin || null,
        profileVisibility: profileVisibility || "public",
        isVerified: false, // New users start as unverified until they use the OTP
        isActive: true,
      }
    })

    /* ===================== NOTIFY ADMIN ===================== */
    try {
      const io = getIO();
      io.to("admin_room").emit("new_user_registration", {
        id: newUser.id,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        username: newUser.username,
        time: new Date()
      });
    } catch (ioError) {
      console.warn("Socket notification failed for new user registration");
    }


    /* ===================== SUCCESS RESPONSE ===================== */
    // Note: OTP is now sent upon first Login attempt, not immediately at registration.
    const { password: _, ...userData } = newUser;
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please login to verify your account.",
      data: userData
    })

  } catch (error) {
    next(error) // Send any unexpected errors to our central Error Handler
  }
}

/**
 * ==============================================================================
 * VERIFY OTP CONTROLLER
 * Goal: Check if the OTP entered by the user matches our "Sticky Note" in Redis.
 * ==============================================================================
 */
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp } = req.body
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" })
    }

    if (!redisClient.isOpen) await redisClient.connect()

    // 1. Look for the "Sticky Note" (OTP) in Redis memory
    const otpKey = `otp:${email}`
    const storedOtp = await redisClient.get(otpKey)

    // 2. If it's not there, it means it expired or the email is wrong
    if (!storedOtp) {
      return res.status(400).json({ message: "OTP expired or not found" })
    }

    // 3. Compare the codes
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    // 4. If code is correct, update the user's status in the Filing Cabinet (PostgreSQL)
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    })

    // 5. Delete the Sticky Note from Redis (we don't need it anymore)
    await redisClient.del(otpKey)

    // 6. Send a Welcome Email in the background
    try {
      await addEmailToQueue({
        email: user.email,
        subject: "Welcome to ConnectiFy!",
        message: `Hi ${user.firstName}, welcome to ConnectiFy!`,
        html: emailTemplates.welcome(user.firstName),
      })
    } catch (emailError) {
      console.error("Failed to queue welcome email:", emailError)
    }

    const { password: _, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome onboard!",
      data: userData
    })
  } catch (error) {
    next(error)
  }
}

/**
 * ==============================================================================
 * RESEND OTP CONTROLLER
 * Goal: If the previous OTP expired, create a new one and send it again.
 * ==============================================================================
 */
export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    if (!redisClient.isOpen) await redisClient.connect()

    // Check if the user's "folder" exists in our Filing Cabinet
    const user = await prisma.user.findUnique({
      where: { email },
      select: { firstName: true, isVerified: true }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" })
    }

    // Generate a fresh code and save it on a new Sticky Note in Redis
    const otp = generateOTP()
    const otpKey = `otp:${email}`
    await redisClient.setEx(otpKey, 600, otp)

    // Send the new code via the background queue
    try {
      await addEmailToQueue({
        email: email,
        subject: "Your new verification code - ConnectiFy",
        message: `Your new verification code is ${otp}`,
        html: emailTemplates.otp(otp),
      })
    } catch (emailError) {
      console.error("Failed to queue OTP email:", emailError)
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent to your email.",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * ==============================================================================
 * FORGOT PASSWORD CONTROLLER
 * Goal: Create a secure reset link and send it to the user's email.
 * ==============================================================================
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    if (!redisClient.isOpen) await redisClient.connect()

    const user = await prisma.user.findUnique({
      where: { email },
      select: { firstName: true, id: true }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate a secure, long random token (impossible to guess)
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetKey = `reset:${resetToken}`

    // Store this token on a Sticky Note in Redis for 1 hour
    await redisClient.setEx(resetKey, 3600, email)

    // The link the user will click in their email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`

    // Queue the "Reset Password" email
    try {
      await addEmailToQueue({
        email: email,
        subject: "Reset your password - ConnectiFy",
        message: `Click here to reset your password: ${resetLink}`,
        html: emailTemplates.resetPassword(resetLink),
      })
    } catch (emailError) {
      console.error("Failed to queue reset email:", emailError)
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * ==============================================================================
 * RESET PASSWORD CONTROLLER
 * Goal: Use the secret token from the email to update the password.
 * ==============================================================================
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" })
    }

    if (!redisClient.isOpen) await redisClient.connect()

    // 1. Check if the Sticky Note with this token exists in Redis
    const resetKey = `reset:${token}`
    const email = await redisClient.get(resetKey)

    // 2. If it's missing, the link is either wrong or expired
    if (!email) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // 3. Scramble (Hash) the new password for security
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4. Update the folder in our Filing Cabinet (PostgreSQL)
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: { firstName: true, email: true }
    })

    // 5. Delete the Sticky Note from Redis
    await redisClient.del(resetKey)

    // 6. Send a security alert email to the user
    try {
      await addEmailToQueue({
        email: user.email,
        subject: "Security Alert: Password Changed",
        message: `Hi ${user.firstName}, your password was recently changed.`,
        html: emailTemplates.passwordChanged(user.firstName),
      })
    } catch (emailError) {
      console.error("Failed to queue password changed email:", emailError)
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    })
  } catch (error) {
    next(error)
  }
}

/**
 * ==============================================================================
 * LOGIN CONTROLLER
 * Goal: Verify credentials and send a security alert for every successful login.
 * ==============================================================================
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // 1. Find the user's folder in our Filing Cabinet (PostgreSQL)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        experiences: true,
        education: true,
        certificates: true,
        awards: true
      }
    })

    // 2. Compare the scrambled password with what the user typed
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // 3. Check Verification Status
    if (!user.isVerified) {
      // Logic: If user exists but is not verified, send OTP and ask them to verify.

      const otp = generateOTP()
      const otpKey = `otp:${email}`

      // Store OTP in Redis
      if (!redisClient.isOpen) await redisClient.connect()
      await redisClient.setEx(otpKey, 600, otp)

      // Send OTP Email
      try {
        await addEmailToQueue({
          email: user.email,
          subject: "Verify your email - ConnectiFy",
          message: `Your verification code is ${otp}`,
          html: emailTemplates.otp(otp),
        })
      } catch (emailError) {
        console.error("Failed to queue OTP email:", emailError)
      }

      return res.status(200).json({ // Using 200 instead of 403 to indicate "Action Required" rather than "Forbidden"
        success: false,
        requiresVerification: true,
        message: "Account unverified. An OTP has been sent to your email.",
        email: user.email
      })
    }

    // 4. Get some info about their device (simulated for now)
    const device = req.headers["user-agent"] || "Unknown Device"
    const location = "New Login (Simulated Location)"

    // 5. Queue a "Security Alert: New Login" email
    try {
      await addEmailToQueue({
        email: user.email,
        subject: "Security Alert: New Login Detected",
        message: `A new login was detected on ${device}`,
        html: emailTemplates.loginAlert(user.firstName, device, location),
      })
    } catch (emailError) {
      console.error("Failed to queue login alert email:", emailError)
    }

    // 6. Return success
    const { password: _, ...userData } = user;

    // Generate Tokens
    const JWT_SECRET = process.env.JWT_SECRET || "developer";
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '1h' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' } // Long-lived refresh token
    );

    // Save refresh token to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: {
          push: refreshToken
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: userData,
      token: accessToken,
      refreshToken: refreshToken
    })
  } catch (error) {
    next(error)
  }
}

/**
 * REFRESH TOKEN CONTROLLER
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "developer";
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { refreshTokens: true, email: true, id: true }
    });

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Refresh token not recognized" });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT CONTROLLER
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken, userId } = req.body;

    if (refreshToken && userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { refreshTokens: true } });
      if (user) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            refreshTokens: user.refreshTokens.filter(rt => rt !== refreshToken)
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
};
