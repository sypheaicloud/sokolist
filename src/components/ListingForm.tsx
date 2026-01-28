// Inside ListingForm.tsx
export default function ListingForm({ initialData, isEditing }: { initialData?: any, isEditing?: boolean }) {
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

    const handleSubmit = async (formData: FormData) => {
        if (isEditing) {
            // Call the UPDATE action
            await updateListing(initialData.id, formData, imageUrl);
        } else {
            // Call the CREATE action
            await createListing(formData, imageUrl);
        }
    };

    return (
        <form action={handleSubmit}>
            {/* ... your inputs with defaultValue={initialData?.title} ... */}
            <input type="hidden" name="imageUrl" value={imageUrl} />
            <button type="submit">
                {isEditing ? "Save Changes" : "Publish Ad"}
            </button>
        </form>
    );
}