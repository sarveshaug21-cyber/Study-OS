import { withUser, json } from "@/lib/api-helpers";
import { requireDriveAccess } from "@/lib/google-drive-auth";
import { getQuota } from "@/lib/google-drive";
export async function GET() {
  return withUser(async () => {
    const { accessToken } = await requireDriveAccess();
    const quota = await getQuota(accessToken);
    return json({ quota });
  });
}
