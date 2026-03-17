import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface CreateDriveFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  images: FileList | null;
}

export function useCreateDriveWithImages() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDriveFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("location", data.location);
      formData.append("date", data.date);

      if (data.images) {
        Array.from(data.images).forEach((file) => {
          formData.append("images", file);
        });
      }


      const res = await fetch(`${API_BASE_URL}/api/drives/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to create drive");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drives"] });
    },
  });
}
