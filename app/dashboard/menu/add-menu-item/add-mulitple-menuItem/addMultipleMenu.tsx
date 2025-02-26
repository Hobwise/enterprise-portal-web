import { uploadFilemultipleMenuItem } from "@/app/api/controllers/dashboard/menu";
import { CustomButton } from "@/components/customButton";
import useMenu from "@/hooks/cachedEndpoints/useMenu";
import {
  THREEMB,
  generateXLSX,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
import {
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const AddMultipleMenu = ({ selectedMenu }: any) => {
  const router = useRouter();
  const { refetch } = useMenu();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const menuFileUpload = async (formData: FormData, file: any) => {
    setIsLoading(true);
    setImageError("");
    const data = await uploadFilemultipleMenuItem(
      businessInformation[0]?.businessId,
      formData,
      selectedMenu
    );
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      toast.success("Upload Successful");
      refetch();
      router.push("/dashboard/menu");
    } else {
      notify({
        title: "Error!",
        text: data?.data?.errors.map((item: any) => (
          <span className="flex flex-col gap-1">
            <span>{item.responseDescription}</span>
          </span>
        )),
        type: "error",
      });
    }
  };

  const handleFileChange = async (event: any) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > THREEMB) {
        return setImageError("File too large");
      }
      if (
        file &&
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const formData = new FormData();
        formData.append("file", file);
        menuFileUpload(formData, file);
      } else {
        return setImageError("Please select an XLSX file");
      }

      //   const compressedFile = await imageCompression(file, imageCompressOptions);
    }
  };

  const excelColumns = [
    {
      Name: "Avocado Chicken Salad",
      Description:
        "Fresh romaine lettuce, grilled chicken, avocado slices, cherry tomatoes, and feta cheese, served with a tangy balsamic dressing.",
      Price: "100",
      Availability: "TRUE",
    },
    {
      Name: "Classic Margherita Pizza",
      Description:
        "A crispy thin-crust pizza topped with fresh tomato sauce, mozzarella cheese, and basil leaves, drizzled with extra virgin olive oil.",
      Price: "300",
      Availability: "FALSE",
    },
  ];

  const cells = Array.from({ length: 4 }, (_, cellIndex) => cellIndex + 1);
  return (
    <section>
      <div className="mt-8">
        <h1 className="text-[28px] text-black mb-2 leading-8 font-bold">
          Bulk upload items to your menu
        </h1>
        <p className="font-[500]  text-grey600 mb-4">
          Upload a spreadsheet with the columns formatted in the following
          order; “Name”, “Description”, “Price”, "Availability"
        </p>
      </div>
      <Spacer y={8} />
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>AVAILABILITY</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key={1}>
            {cells.map((cell) => (
              <TableCell key={`${1}-${cell}`}>
                <div className="h-2 w-12 bg-gray-100 rounded-lg" />
              </TableCell>
            ))}
          </TableRow>
          <TableRow key={2}>
            {cells.map((cell) => (
              <TableCell key={`${2}-${cell}`}>
                <div className="h-2 w-12 bg-gray-100 rounded-lg" />
              </TableCell>
            ))}
          </TableRow>
          <TableRow key={3}>
            {cells.map((cell) => (
              <TableCell key={`${3}-${cell}`}>
                <div className="h-2 w-12 bg-gray-100 rounded-lg" />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      <Spacer y={8} />
      <CustomButton
        className="bg-transparent w-full border border-grey600"
        onClick={() => generateXLSX(excelColumns)}
      >
        Download Sample
      </CustomButton>
      <Spacer y={4} />
      <div className="flex justify-center items-center">
        <label className="cursor-pointer relative bg-primaryColor  rounded-lg font-semibold  w-full h-[55px]  text-center">
          <span className="absolute top-4 left-[40%]">
            {isLoading ? "Loading..." : "Upload XLSX"}
          </span>

          <input
            type="file"
            multiple
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      {imageError && (
        <span className="text-sm float-left text-danger-600">{imageError}</span>
      )}
      {/* <CustomButton
        className='w-full h-[55px] text-white'
        loading={isLoading}
        disabled={isLoading}
        // onClick={() => {
        //   setActiveScreen(2);
        // }}
        type='submit'
      >
        {isLoading ? 'Loading' : 'Upload CSV'}
      </CustomButton> */}
      <Spacer y={8} />
    </section>
  );
};

export default AddMultipleMenu;
