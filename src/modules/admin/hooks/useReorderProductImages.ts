import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderProductImages } from "@/modules/admin/api";

interface ReorderProductImagesArgs {
  slug: string;
  images: string[];
  primaryImageIndex: number;
}

export function useReorderProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, images, primaryImageIndex }: ReorderProductImagesArgs) =>
      reorderProductImages(slug, images, primaryImageIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
