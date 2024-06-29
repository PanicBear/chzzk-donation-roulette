import Button from "@/components/button";
import Input from "@/components/input";
import useStorage from "@/hooks/useStorage";
import { updateRouletteOption } from "@/libs/firebase";
import { DonationOption } from "@/schema";
import rollRoulette from "@/utils/roll/roulette";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback } from "react";
import {
  Controller,
  UseFieldArrayProps,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface OptionFieldProps extends UseFieldArrayProps<DonationOption> {}

const OptionField = (
  props: OptionFieldProps & {
    label: string;
    name: `option.${number}.rouletteOption`;
  }
) => {
  const { fields, append, remove } = useFieldArray({
    ...props,
  });

  return (
    <div>
      <h3 className={twMerge("text-lg")}>{props.label}</h3>
      <div className={twMerge("w-full", "grid grid-cols-3 gap-4")}>
        <label className={twMerge("flex justify-start items-center")}>
          항목
        </label>
        <label className={twMerge("flex justify-start items-center")}>
          비율
        </label>
        <Button
          type="button"
          onClick={() =>
            append({
              label: `${props.label} 항목`,
              ratio: 1,
            })
          }
        >
          항목 추가
        </Button>
        {!!fields.length ? (
          fields.map((field, index) => {
            const label = `${props.name}.${index}.label` as const;
            const ratio = `${props.name}.${index}.ratio` as const;

            return (
              <Fragment key={field.id}>
                <Controller
                  name={label}
                  control={props.control}
                  render={({ field }) => {
                    return <Input {...field}></Input>;
                  }}
                />
                <Controller
                  name={ratio}
                  control={props.control}
                  render={({ field }) => {
                    return <Input type="number" {...field}></Input>;
                  }}
                />

                <Button onClick={() => remove(index)}>항목 삭제</Button>
              </Fragment>
            );
          })
        ) : (
          <span>룰렛에 사용될 옵션을 추가해주세요</span>
        )}
      </div>
    </div>
  );
};

const Donation = () => {
  const router = useRouter();
  const channelId = router.query.channelId + "";

  const { setItem } = useStorage();

  const methods = useForm<DonationOption>({
    resolver: zodResolver(DonationOption),
    defaultValues: {
      option: [
        {
          roulette: false,
          label: "일반 촌지",
          trigger: "(일반)",
          amount: 5089,
        },
        {
          roulette: true,
          rouletteOption: [
            {
              label: "고급 촌지 가챠 항목1 - 당첨",
              ratio: 5,
            },
            {
              label: "고급 촌지 가챠 항목2 - 꽝",
              ratio: 95,
            },
          ],
          label: "고급 촌지 가챠",
          trigger: "(고급)",
          amount: 3089,
        },
        {
          roulette: true,
          rouletteOption: [
            {
              label: "외형 변경권 항목1",
              ratio: 10,
            },
            {
              label: "외형 변경권 항목2",
              ratio: 87,
            },
          ],
          label: "외형 변경권",
          trigger: "(외형)",
          amount: 4089,
        },
      ],
      dummyDonation: {
        nickname: "패닉베어",
        message: "(일반)",
        amount: 1,
      },
      // option: [
      //   {
      //     amount: 5089,
      //     trigger: "(일반)",
      //     label: "일반 촌지",
      //     roulette: false,
      //   },
      //   {
      //     amount: 3089,
      //     trigger: "(고급)",
      //     label: "고급 촌지 가챠",
      //     roulette: true,
      //   },
      //   {
      //     amount: 4089,
      //     trigger: "(외형)",
      //     label: "외형 변경권",
      //     roulette: false,
      //   },
      // ],
      // dummyDonation: {
      //   message: "",
      //   amount: 1,
      // },
    },
  });

  const options = methods.watch("option");

  const { fields, append, remove } = useFieldArray({
    name: "option",
    control: methods.control,
  });

  const handleDonationTest: () => void = useCallback(() => {
    const form = methods.getValues();
    const { option, dummyDonation } = form;

    if (dummyDonation?.amount && dummyDonation?.nickname) {
      const { amount, message } = dummyDonation;

      const matchedOption = option.find((option) => {
        return option.amount === amount || message?.includes(option.trigger);
      });

      console.log(matchedOption);
      const rouletteResult =
        matchedOption?.roulette && matchedOption.rouletteOption
          ? `\n룰렛 결과: ${
              matchedOption.rouletteOption[
                rollRoulette(matchedOption.rouletteOption)
              ].label
            }`
          : ``;

      return alert(
        `도네이션 종류 : ${
          matchedOption?.label ?? "일반 후원"
        }${rouletteResult}`
      );
    }

    alert("모든 입력필드를 채워주세요: 닉네임, 메시지, 액수");
  }, [methods]);

  const handleValidSubmit = useCallback(
    ({ option }: DonationOption) => {
      const value = { option };
      updateRouletteOption({ channelId, value });

      setItem("eaf7b569c9992d0e57db0059eb5c0eeb", value);
      alert("옵션 값이 브라우저에 저장되었습니다.");
    },
    [channelId, setItem]
  );

  const handleInvalidSubmit = useCallback((err: any) => {
    alert(`에러 ${JSON.stringify(err)}`);
  }, []);

  return (
    <form
      className={twMerge(
        "w-full",
        "p-4",
        "flex flex-col justify-start items-start gap-12"
      )}
      onSubmit={methods.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
    >
      <section className={twMerge("w-full", "space-y-4")}>
        <h2 className={twMerge("text-xl")}>액수 별 설정</h2>
        <div className={twMerge("w-full", "grid grid-cols-5 gap-4")}>
          <label className={twMerge("flex justify-center items-center")}>
            항목
          </label>
          <label className={twMerge("flex justify-center items-center")}>
            액수(일치 시 동작)
          </label>
          <label className={twMerge("flex justify-center items-center")}>
            트리거(포함 시 동작)
          </label>
          <label className={twMerge("flex justify-center items-center")}>
            룰렛 사용 여부(체크 시 동작)
          </label>
          <Button
            type="button"
            onClick={() =>
              append({
                label: "룰렛 종류",
                amount: 10000,
                roulette: false,
                trigger: "",
              })
            }
          >
            항목 추가
          </Button>
          {fields.map((field, index) => {
            const label = `option.${index}.label` as const;
            const amount = `option.${index}.amount` as const;
            const trigger = `option.${index}.trigger` as const;
            const roulette = `option.${index}.roulette` as const;

            return (
              <Fragment key={field.id}>
                <Fragment>
                  <Controller
                    name={label}
                    control={methods.control}
                    render={({ field }) => {
                      return <Input {...field}></Input>;
                    }}
                  />
                  <Controller
                    name={amount}
                    control={methods.control}
                    render={({ field }) => {
                      return <Input {...field} type="number" min={0}></Input>;
                    }}
                  />

                  <Controller
                    name={trigger}
                    control={methods.control}
                    render={({ field }) => {
                      return <Input {...field}></Input>;
                    }}
                  />
                  <Controller
                    name={roulette}
                    control={methods.control}
                    render={({ field }) => {
                      //   <Checkbox
                      //   checked={checked}
                      //   onChange={(event) => setChecked(event.target.checked)}
                      //   name="checked"
                      //   color="primary"
                      //   size="small"
                      // />
                      return (
                        <Input
                          type="checkbox"
                          onChange={(e) => field.onChange(e.target.checked)}
                          checked={field.value}
                        />
                      );
                    }}
                  />
                  <Button onClick={() => remove(index)}>항목 삭제</Button>
                </Fragment>
                {/* {methods.watch(roulette) && (
                  <Fragment>
                    <div />
                    <span>룰렛 옵션 설정</span>
                    <span>라벨</span>
                    <span>비율</span>
                    <span>항목추가</span>
                  </Fragment>
                )} */}
              </Fragment>
            );
          })}
        </div>
      </section>

      <div
        className={twMerge("w-full", "flex flex-row justify-start items-start")}
      >
        {!!options.filter((el) => el.roulette).length && (
          <section className={twMerge("w-full", "flex flex-col gap-4")}>
            <h2 className={twMerge("text-xl")}>룰렛 별 옵션 설정</h2>

            {options.map((option, index) => {
              const name = `option.${index}.rouletteOption` as const;

              if (!option.roulette) return <Fragment key={name}></Fragment>;

              return (
                <OptionField
                  label={options[index].label}
                  key={name}
                  name={name}
                  control={methods.control}
                />
              );
            })}
          </section>
        )}

        <section className={twMerge("w-full", "flex flex-col gap-4")}>
          <h2 className={twMerge("text-xl")}>가상 도네이션</h2>

          <div className={twMerge("flex justify-start items-end gap-4")}>
            <fieldset className={twMerge("flex flex-col gap-2")}>
              <label className={twMerge("flex justify-start items-center")}>
                닉네임
              </label>
              <Controller
                control={methods.control}
                name="dummyDonation.nickname"
                render={({ field }) => <Input {...field} />}
              />
            </fieldset>
            <fieldset className={twMerge("flex flex-col gap-2")}>
              <label className={twMerge("flex justify-start items-center")}>
                메시지
              </label>
              <Controller
                control={methods.control}
                name="dummyDonation.message"
                render={({ field }) => <Input {...field} />}
              />
            </fieldset>

            <fieldset className={twMerge("flex flex-col gap-2")}>
              <label className={twMerge("flex justify-start items-center")}>
                액수
              </label>

              <Controller
                control={methods.control}
                name="dummyDonation.amount"
                render={({ field }) => <Input {...field} />}
              />
            </fieldset>
            <fieldset className={twMerge("flex flex-col gap-2")}>
              <Button type="button" onClick={handleDonationTest}>
                후원
              </Button>
            </fieldset>
          </div>
        </section>
      </div>

      <Button type="submit">옵션 저장</Button>
    </form>
  );
};

export default function Page() {
  const router = useRouter();

  return (
    <>
      <Link href={`/test/${router.query.channelId}`} passHref>
        뒤로가기
      </Link>
      <Donation />
    </>
  );
}
