import { prisma } from "../prisma/prismaClient.js";
import { createAdmin } from "../prisma/userService.js";

export const promoteToAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({ success: false, message: "User is already an admin" });
    }

    // 2. Update role
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    // 3. Create admin metadata
    await createAdmin(user.id, "System Administrator", true);

    return res.status(200).json({
      success: true,
      message: `User ${user.email} promoted to ADMIN`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};