
import { useRouter } from "next/navigation";

export default function useSave() {
  const router = useRouter();

  const saveRoute = (
) => {
   

    router.push("/tripplan");
  };
  return { saveRoute };
}
