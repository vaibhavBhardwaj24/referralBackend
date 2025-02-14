import express, { json } from "express";
import prisma from "./prismaClient.js";
import { referralSender } from "./mailer.js";
import cors from "cors";
const app = express();

app.use(json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, referralId } = req.body;
    if (!name || !email) {
      return res.status(301).json("Name or email not present");
    }
    // console.log(name, email, referralId);
    const data = await prisma.user.create({
      data: {
        name,
        email,
        ...(referralId && { referredBy: { connect: { id: referralId } } }),
      },
    });
    if (referralId) {
      await prisma.referral.update({
        where: { id: referralId },
        data: { referree: { connect: { id: data.id } } },
      });
    }
    return res.status(201).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/referral", async (req, res) => {
  try {
    const { programId, userId, refEmail } = req.body;
    if (!programId || !userId) {
      return res.status(301).json("All data not sent");
    }
    const referral = await prisma.referral.create({
      data: {
        program: {
          connect: {
            id: programId,
          },
        },
        referrer: {
          connect: {
            id: userId,
          },
        },
      },
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(301).json("Invalid user ID");
    }
    const mail = await referralSender({
      reffId: Number(referral.id),
      email: refEmail,
      name: String(user?.name),
    });
    console.log(mail);
    return res.status(201).json(referral);
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.get("/course", async (req, res) => {
  try {
    const courses = await prisma.program.findMany();
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.post("/course", async (req, res) => {
  try {
    const { name, referreeBonus, referrerBonus } = req.body;
    if (!name || !referreeBonus || !referrerBonus) {
      return res.status(301).json("All data not sent");
    }
    const course = await prisma.program.create({
      data: {
        name: name,
        referreeBonus: referreeBonus,
        referrerBonus: referrerBonus,
      },
    });
    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json(error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
