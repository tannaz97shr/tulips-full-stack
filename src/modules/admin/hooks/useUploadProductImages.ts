import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProductImages } from "@/modules/admin/api";

interface UploadProductImagesArgs {
  slug: string;
  files: File[];
}

export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, files }: UploadProductImagesArgs) => uploadProductImages(slug, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
