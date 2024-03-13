interface ExportButtonProps  {
    callback: () => Promise<void>

}
export default function ExportButton({callback}:ExportButtonProps) {
    const onClickExport = async () => {
        await callback();
    }
    return (
        <div class="row">
            <weave-button variant={"solid"} onClick={onClickExport}>
                Save Trees to Library
            </weave-button>
        </div>
    );
}