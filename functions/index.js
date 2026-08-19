const {
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");

const {
  defineSecret,
} = require("firebase-functions/params");

const {
  initializeApp,
} = require("firebase-admin/app");

const {
  getAuth,
} = require("firebase-admin/auth");

const {
  getFirestore,
  FieldValue,
  Timestamp,
} = require("firebase-admin/firestore");

const crypto = require("crypto");

const nodemailer = require("nodemailer");

// ============================================================
// FIREBASE ADMIN
// ============================================================

initializeApp();

const db = getFirestore();

const adminAuth = getAuth();

// ============================================================
// GMAIL SMTP SECRETS
// ============================================================

const SMTP_USER =
  defineSecret("SMTP_USER");

const SMTP_PASS =
  defineSecret("SMTP_PASS");

// ============================================================
// SETTINGS
// ============================================================

const OTP_EXPIRE_MINUTES = 10;

const RESET_TOKEN_EXPIRE_MINUTES = 15;

const MAX_OTP_ATTEMPTS = 5;

// ============================================================
// RANDOM OTP
// ============================================================

function createOtp() {
  return Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();
}

// ============================================================
// HASH
// ============================================================

function hashValue(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

// ============================================================
// CREATE RESET TOKEN
// ============================================================

function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================
// SEND OTP EMAIL
// ============================================================

async function sendOtpEmail(
  email,
  otp,
  smtpUser,
  smtpPass
) {
  const transporter =
    nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

  await transporter.sendMail({
    from: `"SoleStyle" <${smtpUser}>`,

    to: email,

    subject:
      "SoleStyle Password Reset OTP",

    text: `
SoleStyle Password Reset

Your verification code is:

${otp}

This code will expire in ${OTP_EXPIRE_MINUTES} minutes.

If you did not request a password reset, you can ignore this email.

SoleStyle
`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background:#f4f4f5;
        padding:40px 20px;
      ">

        <div style="
          max-width:500px;
          margin:auto;
          background:white;
          border-radius:18px;
          padding:35px;
          text-align:center;
        ">

          <h1 style="
            color:#f97316;
            margin-bottom:10px;
          ">
            SoleStyle
          </h1>

          <h2>
            Password Reset
          </h2>

          <p style="
            color:#555;
            line-height:1.6;
          ">
            Use the verification code below
            to reset your password.
          </p>

          <div style="
            margin:30px 0;
            padding:20px;
            background:#fff7ed;
            border-radius:14px;
            font-size:34px;
            font-weight:bold;
            letter-spacing:10px;
            color:#f97316;
          ">
            ${otp}
          </div>

          <p style="
            color:#777;
            font-size:14px;
          ">
            This code expires in
            ${OTP_EXPIRE_MINUTES} minutes.
          </p>

          <p style="
            color:#999;
            font-size:13px;
            margin-top:30px;
          ">
            If you did not request this password reset,
            you can safely ignore this email.
          </p>

        </div>

      </div>
    `,
  });
}

// ============================================================
// SEND PASSWORD RESET OTP
// ============================================================

exports.sendPasswordResetOtp =
  onCall(
    {
      region: "asia-southeast1",

      secrets: [
        SMTP_USER,
        SMTP_PASS,
      ],

      timeoutSeconds: 60,

      memory: "256MiB",
    },

    async (request) => {
      // --------------------------------------------------------
      // CHECK DATA
      // --------------------------------------------------------

      const email =
        request.data?.email
          ?.trim()
          .toLowerCase();

      if (!email) {
        throw new HttpsError(
          "invalid-argument",
          "សូមបញ្ចូល Gmail របស់អ្នក។"
        );
      }

      if (
        !/^[^\s@]+@gmail\.com$/i.test(
          email
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "សូមប្រើ Gmail ដែលត្រឹមត្រូវ។"
        );
      }

      // --------------------------------------------------------
      // CHECK USER
      // --------------------------------------------------------

      let user;

      try {
        user =
          await adminAuth.getUserByEmail(
            email
          );
      } catch (error) {
        if (
          error.code ===
          "auth/user-not-found"
        ) {
          throw new HttpsError(
            "not-found",
            "រកមិនឃើញ Gmail នេះក្នុងប្រព័ន្ធទេ។"
          );
        }

        console.error(
          "Firebase Auth error:",
          error
        );

        throw new HttpsError(
          "internal",
          "មិនអាចពិនិត្យ Gmail បានទេ។"
        );
      }

      // --------------------------------------------------------
      // CHECK PASSWORD PROVIDER
      // --------------------------------------------------------

      const hasPasswordProvider =
        user.providerData.some(
          (provider) =>
            provider.providerId ===
            "password"
        );

      if (!hasPasswordProvider) {
        throw new HttpsError(
          "failed-precondition",
          "Gmail នេះមិនមាន Password Login ទេ។ សូមប្រើ Google Login។"
        );
      }

      // --------------------------------------------------------
      // CHECK RECENT OTP
      // --------------------------------------------------------

      const existingSnapshot =
        await db
          .collection(
            "passwordResetOtps"
          )
          .where(
            "email",
            "==",
            email
          )
          .where(
            "used",
            "==",
            false
          )
          .limit(1)
          .get();

      if (
        !existingSnapshot.empty
      ) {
        const existing =
          existingSnapshot.docs[0];

        const existingData =
          existing.data();

        if (
          existingData.createdAt
        ) {
          const createdTime =
            existingData.createdAt.toMillis();

          const now =
            Date.now();

          const seconds =
            (now - createdTime) /
            1000;

          // Prevent spam:
          // one OTP every 60 seconds
          if (seconds < 60) {
            throw new HttpsError(
              "resource-exhausted",
              "សូមរង់ចាំ 60 វិនាទី មុនពេលស្នើ OTP ថ្មី។"
            );
          }
        }

        await existing.ref.update({
          used: true,
        });
      }

      // --------------------------------------------------------
      // CREATE OTP
      // --------------------------------------------------------

      const otp = createOtp();

      const otpHash =
        hashValue(otp);

      const expiresAt =
        Timestamp.fromMillis(
          Date.now() +
            OTP_EXPIRE_MINUTES *
              60 *
              1000
        );

      // --------------------------------------------------------
      // SAVE OTP
      // --------------------------------------------------------

      const otpDocument = {
        email,

        userId: user.uid,

        otpHash,

        expiresAt,

        createdAt:
          FieldValue.serverTimestamp(),

        used: false,

        attempts: 0,

        maxAttempts:
          MAX_OTP_ATTEMPTS,
      };

      await db
        .collection(
          "passwordResetOtps"
        )
        .add(otpDocument);

      // --------------------------------------------------------
      // SEND EMAIL
      // --------------------------------------------------------

      try {
        await sendOtpEmail(
          email,
          otp,
          SMTP_USER.value(),
          SMTP_PASS.value()
        );
      } catch (error) {
        console.error(
          "SMTP ERROR:",
          error
        );

        throw new HttpsError(
          "internal",
          "Server មិនអាចផ្ញើ Gmail បានទេ។ សូមពិនិត្យ Gmail SMTP settings។"
        );
      }

      // --------------------------------------------------------
      // RESPONSE
      // --------------------------------------------------------

      return {
        success: true,

        message:
          "OTP បានផ្ញើទៅ Gmail របស់អ្នក។",
      };
    }
  );

// ============================================================
// VERIFY PASSWORD RESET OTP
// ============================================================

exports.verifyPasswordResetOtp =
  onCall(
    {
      region: "asia-southeast1",

      timeoutSeconds: 30,

      memory: "256MiB",
    },

    async (request) => {
      // --------------------------------------------------------
      // DATA
      // --------------------------------------------------------

      const email =
        request.data?.email
          ?.trim()
          .toLowerCase();

      const otp =
        request.data?.otp
          ?.trim();

      if (!email || !otp) {
        throw new HttpsError(
          "invalid-argument",
          "Email និង OTP ត្រូវការ។"
        );
      }

      if (
        !/^\d{6}$/.test(otp)
      ) {
        throw new HttpsError(
          "invalid-argument",
          "OTP ត្រូវមាន 6 ខ្ទង់។"
        );
      }

      // --------------------------------------------------------
      // FIND OTP
      // --------------------------------------------------------

      const snapshot =
        await db
          .collection(
            "passwordResetOtps"
          )
          .where(
            "email",
            "==",
            email
          )
          .where(
            "used",
            "==",
            false
          )
          .orderBy(
            "createdAt",
            "desc"
          )
          .limit(1)
          .get();

      if (snapshot.empty) {
        throw new HttpsError(
          "not-found",
          "រកមិនឃើញ OTP។ សូមស្នើ OTP ថ្មី។"
        );
      }

      const doc =
        snapshot.docs[0];

      const data =
        doc.data();

      // --------------------------------------------------------
      // CHECK EXPIRATION
      // --------------------------------------------------------

      if (
        data.expiresAt &&
        data.expiresAt.toMillis() <
          Date.now()
      ) {
        await doc.ref.update({
          used: true,
        });

        throw new HttpsError(
          "deadline-exceeded",
          "OTP បានផុតកំណត់។ សូមស្នើ OTP ថ្មី។"
        );
      }

      // --------------------------------------------------------
      // CHECK ATTEMPTS
      // --------------------------------------------------------

      const attempts =
        data.attempts || 0;

      if (
        attempts >=
        MAX_OTP_ATTEMPTS
      ) {
        await doc.ref.update({
          used: true,
        });

        throw new HttpsError(
          "resource-exhausted",
          "អ្នកបានបញ្ចូល OTP ខុសច្រើនពេក។ សូមស្នើ OTP ថ្មី។"
        );
      }

      // --------------------------------------------------------
      // CHECK OTP
      // --------------------------------------------------------

      const submittedHash =
        hashValue(otp);

      if (
        submittedHash !==
        data.otpHash
      ) {
        await doc.ref.update({
          attempts:
            attempts + 1,
        });

        throw new HttpsError(
          "permission-denied",
          "OTP មិនត្រឹមត្រូវ។"
        );
      }

      // --------------------------------------------------------
      // CREATE RESET TOKEN
      // --------------------------------------------------------

      const resetToken =
        createResetToken();

      const resetTokenHash =
        hashValue(
          resetToken
        );

      const resetTokenExpiresAt =
        Timestamp.fromMillis(
          Date.now() +
            RESET_TOKEN_EXPIRE_MINUTES *
              60 *
              1000
        );

      // --------------------------------------------------------
      // UPDATE OTP DOCUMENT
      // --------------------------------------------------------

      await doc.ref.update({
        used: true,

        verified: true,

        resetTokenHash,

        resetTokenExpiresAt,

        verifiedAt:
          FieldValue.serverTimestamp(),
      });

      // --------------------------------------------------------
      // RETURN TOKEN
      // --------------------------------------------------------

      return {
        success: true,

        resetToken,

        message:
          "OTP ត្រឹមត្រូវ។",
      };
    }
  );

// ============================================================
// RESET PASSWORD WITH OTP
// ============================================================

exports.resetPasswordWithOtp =
  onCall(
    {
      region: "asia-southeast1",

      timeoutSeconds: 30,

      memory: "256MiB",
    },

    async (request) => {
      // --------------------------------------------------------
      // DATA
      // --------------------------------------------------------

      const email =
        request.data?.email
          ?.trim()
          .toLowerCase();

      const resetToken =
        request.data?.resetToken
          ?.trim();

      const newPassword =
        request.data?.newPassword;

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        !email ||
        !resetToken ||
        !newPassword
      ) {
        throw new HttpsError(
          "invalid-argument",
          "ព័ត៌មានមិនពេញលេញ។"
        );
      }

      if (
        newPassword.length < 6
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Password ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ។"
        );
      }

      // --------------------------------------------------------
      // HASH TOKEN
      // --------------------------------------------------------

      const resetTokenHash =
        hashValue(
          resetToken
        );

      // --------------------------------------------------------
      // FIND VERIFIED RESET
      // --------------------------------------------------------

      const snapshot =
        await db
          .collection(
            "passwordResetOtps"
          )
          .where(
            "email",
            "==",
            email
          )
          .where(
            "resetTokenHash",
            "==",
            resetTokenHash
          )
          .where(
            "verified",
            "==",
            true
          )
          .limit(1)
          .get();

      if (snapshot.empty) {
        throw new HttpsError(
          "permission-denied",
          "Reset session មិនត្រឹមត្រូវ។"
        );
      }

      const doc =
        snapshot.docs[0];

      const data =
        doc.data();

      // --------------------------------------------------------
      // CHECK TOKEN EXPIRATION
      // --------------------------------------------------------

      if (
        !data.resetTokenExpiresAt ||
        data.resetTokenExpiresAt.toMillis() <
          Date.now()
      ) {
        await doc.ref.update({
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        });

        throw new HttpsError(
          "deadline-exceeded",
          "Reset session បានផុតកំណត់។ សូមចាប់ផ្តើមម្ដងទៀត។"
        );
      }

      // --------------------------------------------------------
      // GET USER
      // --------------------------------------------------------

      let user;

      try {
        user =
          await adminAuth.getUserByEmail(
            email
          );
      } catch (error) {
        console.error(
          "Get user error:",
          error
        );

        throw new HttpsError(
          "not-found",
          "រកមិនឃើញ Account។"
        );
      }

      // --------------------------------------------------------
      // UPDATE PASSWORD
      // --------------------------------------------------------

      try {
        await adminAuth.updateUser(
          user.uid,
          {
            password:
              newPassword,
          }
        );
      } catch (error) {
        console.error(
          "Update password error:",
          error
        );

        throw new HttpsError(
          "internal",
          "មិនអាចប្ដូរ Password បានទេ។"
        );
      }

      // --------------------------------------------------------
      // INVALIDATE RESET SESSION
      // --------------------------------------------------------

      await doc.ref.update({
        resetTokenHash: null,

        resetTokenExpiresAt: null,

        passwordResetCompleted: true,

        passwordResetAt:
          FieldValue.serverTimestamp(),
      });

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      return {
        success: true,

        message:
          "Password បាន Reset ជោគជ័យ។",
      };
    }
  );