import AssetTable from "@/components/market/AssetTable";

function page() {
  return (
    <div className="p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-left lg:text-5xl">Marknad</h1>
        <p className="lg:text-xl">Här finner du realtidspriser för olika kryptovalutor.</p>
        <AssetTable />
    </div>
  );
}

export default page;