import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
// Returns a short-lived access token for client-side Google Picker. Server-side only origin.
export async function GET() {
  return withUser(async () => {
    const { accessToken } = await requireDriveAccess();
    return json({ accessToken });
  });
}
