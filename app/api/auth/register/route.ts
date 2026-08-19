import { signUpSchema } from "@/modules/auth/lib/schemas";
import { createUser, findUserByEmail } from "@/modules/auth/lib/userRepository";
import bcrypt from "bcryptjs";

// Credentials provider's authorize() can only verify, not register — this
// route is where sign-up actually creates the Firestore users doc.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, name, passwordHash });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Failed to register user:", error);
    return Response.json({ error: "Failed to register" }, { status: 500 });
  }
}
