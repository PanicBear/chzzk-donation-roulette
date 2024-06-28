import Button from "@/components/button";
import Input from "@/components/input";
import { OPTION_MIN_LENGTH, OPTION_DEFAULT } from "@/constants";
import useStorage from "@/hooks/useStorage";
import { RouletteOption } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export default function Page() {
  const router = useRouter();
  const channelId = router.query.channelId + "";

  const { getItem, setItem } = useStorage();

  const methods = useForm<RouletteOption>({
    resolver: zodResolver(RouletteOption),
  });

  const { fields, append, remove } = useFieldArray({
    name: "option",
    control: methods.control,
  });

  const handleOptionAppend = useCallback(() => {
    append({ label: "항목", ratio: 1 });
  }, [append]);

  const handleOptionRemove = useCallback(
    (index: number) => {
      if (fields.length <= OPTION_MIN_LENGTH) return;
      remove(index);
    },
    [fields.length, remove]
  );

  const handleValidForm = useCallback(
    (form: RouletteOption) => {
      console.log(form);
      setItem(channelId, form);
    },
    [channelId, setItem]
  );

  useEffect(() => {
    if (!channelId) return;

    const defalutValues = getItem(channelId + "") ?? { option: OPTION_DEFAULT };

    methods.reset(defalutValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  return (
    <>
      <section className={twMerge("p-4")}></section>
      <form
        onSubmit={methods.handleSubmit(handleValidForm, console.error)}
        className={twMerge("p-4", "flex flex-col gap-4")}
      >
        <div className={twMerge("w-full", "grid grid-cols-3 gap-4")}>
          <label>항목</label>
          <label>비율</label>
          <div />
          {fields.map((field, index) => {
            const name = `option.${index}.label` as const;
            const ratio = `option.${index}.ratio` as const;

            return (
              <Fragment key={field.id}>
                <Controller
                  name={name}
                  control={methods.control}
                  render={({ field }) => (
                    <Input {...field} name={name} id={name} />
                  )}
                />
                <Controller
                  name={ratio}
                  control={methods.control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      name={ratio}
                      id={ratio}
                      min={1}
                    />
                  )}
                />
                <Button onClick={() => handleOptionRemove(index)}>삭제</Button>
              </Fragment>
            );
          })}
        </div>
        <div className={twMerge("flex flex-row gap-4")}>
          <Button onClick={handleOptionAppend}>항목 추가</Button>
          <Button>제출</Button>
        </div>
      </form>
      <span>룰렛 미리보기?</span>
    </>
  );
}
