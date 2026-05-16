export default function Header() {
  return (
    <>
      <div className=" flex items-center justify-between p-6">
        <div className=" items-center max-w-2xl">
          <h1 className="text-2xl font-serif px-3 bg-linear-to-r from-amber-500 via-amber-200 to-amber-500 bg-clip-text text-transparent font-semibold">
            Pixeled
          </h1>
        </div>
        <div className="flex max-w-2xl items-center">
          <div className="flex text-white items-center text-lg p-2 gap-6 mr-24">
            <a className="cursor-pointer hover:text-neutral-300" href="#">
              Home
            </a>
            <a className="cursor-pointer hover:text-neutral-300" href="#">
              About
            </a>
            <a className="cursor-pointer hover:text-neutral-300" href="#">
              Services
            </a>
          </div>
          <button className="flex text-lg font-semibold text-black cursor-pointer rounded-lg px-4 py-2 tracking-tight bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:brightness-110 transition">
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
