import { DoctorSkeleton } from "@/components/doctor/doctor-skeleton";
import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <Container>
      <DoctorSkeleton />
    </Container>
  );
}
