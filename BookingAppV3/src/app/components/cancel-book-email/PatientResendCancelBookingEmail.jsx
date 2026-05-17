import { redisIpLimit } from "@/app/lib/redis";
import ClientResendCancelBookingEmail from "./Client";

export default async function ResendCancelBookingEmail({ bookingPubId }) {

  const apiLimit = await redisIpLimit(15, "view_message_page", 60 * 15);
  if (!apiLimit.ok) return <div>{apiLimit.message}</div>;

  return (<>
    <ClientResendCancelBookingEmail bookingPubId={bookingPubId} />
  </>);
}